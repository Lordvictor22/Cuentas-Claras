/**
 * ImageKit Authentication Helpers
 * 
 * ImageKit client-side uploads require an authenticator function that returns
 * { signature, expire, token }.
 */

/**
 * Gera credenciais mock para autenticação do ImageKit.
 * Útil para desenvolvimento, testes ou fallback quando o backend não estiver disponível.
 */
export const mockImageKitAuthenticator = async () => {
  const expire = Math.floor(Date.now() / 1000) + 2400; // 40 minutos a partir de agora
  const token = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `mock_token_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const signature = `mock_signature_${token.slice(0, 12)}_${expire}`;

  return {
    signature,
    expire,
    token
  };
};

/**
 * Função de suporte principal para autenticação do ImageKit.
 * Tenta buscar assinatura em um endpoint configurado (ex: /api/imagekit-auth ou VITE_IMAGEKIT_AUTH_ENDPOINT).
 * Caso não encontre ou falhe, cai suavemente no mock sem quebrar/travar a aplicação.
 */
export const imageKitAuthenticator = async (customEndpoint) => {
  const endpoint = customEndpoint || import.meta.env.VITE_IMAGEKIT_AUTH_ENDPOINT || '/api/imagekit-auth';

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      console.warn(`[ImageKit] Endpoint de autenticação (${endpoint}) respondeu com status ${response.status}. Usando fallback mock.`);
      return await mockImageKitAuthenticator();
    }

    const data = await response.json();

    if (!data || !data.signature || !data.token || !data.expire) {
      console.warn('[ImageKit] Resposta de autenticação incompleta. Usando fallback mock.', data);
      return await mockImageKitAuthenticator();
    }

    return {
      signature: data.signature,
      expire: Number(data.expire),
      token: String(data.token)
    };
  } catch (error) {
    console.warn('[ImageKit] Não foi possível conectar ao endpoint de autenticação. Usando fallback mock para evitar travamentos:', error.message);
    return await mockImageKitAuthenticator();
  }
};

export default imageKitAuthenticator;
