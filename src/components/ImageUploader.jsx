import { useRef, useState } from 'react';
import { IKContext, IKUpload } from 'imagekitio-react';
import { Upload, Image as ImageIcon, Loader2, CheckCircle2, AlertCircle, X, ExternalLink } from 'lucide-react';
import { imageKitAuthenticator } from '../utils/imagekitAuth';

/**
 * Componente reutilizável para upload de imagens no ImageKit.
 * 
 * @param {Object} props
 * @param {Function} props.onSuccess - Callback acionado após o upload com sucesso. Recebe (url, result).
 * @param {Function} [props.onError] - Callback acionado em caso de erro.
 * @param {Function} [props.onUploadStart] - Callback acionado quando o upload inicia.
 * @param {Function} [props.onUploadProgress] - Callback acionado durante o progresso do upload.
 * @param {string} [props.folder] - Pasta de destino no ImageKit (ex: '/comprobantes', '/cuentas-claras').
 * @param {string} [props.fileName] - Nome customizado para o arquivo.
 * @param {Array<string>} [props.tags] - Tags associadas à imagem.
 * @param {string} [props.label] - Título ou texto do botão.
 * @param {string} [props.description] - Texto descritivo / instruções adicionais.
 * @param {string} [props.currentImageUrl] - URL de imagem existente para exibição inicial.
 * @param {boolean} [props.showPreview=true] - Se deve exibir prévia da imagem.
 * @param {string} [props.publicKey] - Chave pública do ImageKit (padrão: VITE_IMAGEKIT_PUBLIC_KEY).
 * @param {string} [props.urlEndpoint] - URL endpoint do ImageKit (padrão: VITE_IMAGEKIT_URL_ENDPOINT).
 * @param {Function} [props.authenticator] - Função de autenticação customizada (padrão: imageKitAuthenticator).
 * @param {boolean} [props.disabled=false] - Desativa a seleção e o upload.
 * @param {string} [props.accept='image/*'] - Tipos MIME aceitos.
 * @param {string} [props.className=''] - Classes adicionais para customização de estilo.
 */
export default function ImageUploader({
  onSuccess,
  onError,
  onUploadStart,
  onUploadProgress,
  folder = '/cuentas-claras',
  fileName,
  tags = ['cuentas-claras'],
  label = 'Subir imagen',
  description = 'Formatos suportados: JPG, PNG, WebP (máx. 10MB)',
  currentImageUrl = '',
  showPreview = true,
  publicKey = import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY,
  urlEndpoint = import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT,
  authenticator = imageKitAuthenticator,
  disabled = false,
  accept = 'image/png, image/jpeg, image/webp, image/gif',
  className = ''
}) {
  const uploadInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState(currentImageUrl || '');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  const isConfigured = Boolean(publicKey && urlEndpoint);

  const handleStart = (event) => {
    setIsUploading(true);
    setProgress(0);
    setErrorMessage('');
    setSuccessMessage('');
    if (onUploadStart) onUploadStart(event);
  };

  const handleProgress = (progressEvent) => {
    if (progressEvent && progressEvent.total) {
      const percentage = Math.round((progressEvent.loaded / progressEvent.total) * 100);
      setProgress(percentage);
    }
    if (onUploadProgress) onUploadProgress(progressEvent);
  };

  const handleError = (error) => {
    setIsUploading(false);
    setProgress(0);
    const message = error?.message || 'Erro ao realizar upload da imagem. Verifique a conexão e tente novamente.';
    setErrorMessage(message);
    console.error('[ImageUploader] Falha no upload:', error);
    if (onError) onError(error);
  };

  const handleSuccess = (result) => {
    setIsUploading(false);
    setProgress(100);
    setErrorMessage('');

    // Obtém a URL pública direta da imagem
    const publicUrl = result?.url || (urlEndpoint ? `${urlEndpoint.replace(/\/$/, '')}/${(result?.filePath || '').replace(/^\//, '')}` : result?.filePath);

    setPreviewUrl(publicUrl);
    setSuccessMessage('Upload concluído com sucesso!');

    if (onSuccess) {
      // Retorna a URL pública principal e os dados completos da resposta
      onSuccess(publicUrl, result);
    }
  };

  const handleTriggerPicker = () => {
    if (disabled || isUploading) return;
    uploadInputRef.current?.click();
  };

  const handleRemoveImage = (e) => {
    e.stopPropagation();
    setPreviewUrl('');
    setSuccessMessage('');
    setErrorMessage('');
    if (uploadInputRef.current) {
      uploadInputRef.current.value = '';
    }
    if (onSuccess) {
      onSuccess('', null);
    }
  };

  // Drag and drop support
  const handleDragOver = (e) => {
    e.preventDefault();
    if (!disabled && !isUploading) setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled || isUploading) return;

    const files = e.dataTransfer?.files;
    if (files && files.length > 0 && uploadInputRef.current) {
      uploadInputRef.current.files = files;
      // Dispara o evento de change no input para iniciar o upload do IKUpload
      const changeEvent = new Event('change', { bubbles: true });
      uploadInputRef.current.dispatchEvent(changeEvent);
    }
  };

  if (!isConfigured) {
    return (
      <div className={`p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-200 text-xs space-y-1 ${className}`}>
        <div className="flex items-center gap-2 font-bold text-amber-300">
          <AlertCircle size={16} />
          Configuração do ImageKit pendente
        </div>
        <p>Defina <code>VITE_IMAGEKIT_PUBLIC_KEY</code> e <code>VITE_IMAGEKIT_URL_ENDPOINT</code> no arquivo <code>.env.local</code>.</p>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Componente Invisível do ImageKit que gerencia o upload */}
      <IKContext
        publicKey={publicKey}
        urlEndpoint={urlEndpoint}
        authenticator={authenticator}
      >
        <IKUpload
          ref={uploadInputRef}
          folder={folder}
          fileName={fileName}
          tags={tags}
          useUniqueFileName={true}
          isPrivateFile={false}
          accept={accept}
          disabled={disabled || isUploading}
          onError={handleError}
          onSuccess={handleSuccess}
          onUploadStart={handleStart}
          onUploadProgress={handleProgress}
          style={{ display: 'none' }}
        />
      </IKContext>

      {/* Área interativa de seleção / Drag & Drop */}
      <div
        onClick={handleTriggerPicker}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`group relative border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
          isDragOver
            ? 'border-emerald-400 bg-emerald-500/10'
            : isUploading
            ? 'border-slate-600 bg-slate-800/60 cursor-wait'
            : disabled
            ? 'border-slate-700 bg-slate-800/30 opacity-60 cursor-not-allowed'
            : 'border-slate-600 bg-slate-800 hover:border-emerald-500/70 hover:bg-slate-800/80'
        }`}
      >
        <div className="flex flex-col items-center justify-center gap-2">
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 size={32} className="text-emerald-400 animate-spin" />
              <p className="text-sm font-semibold text-slate-200">
                Subindo imagem... {progress > 0 ? `${progress}%` : ''}
              </p>
              {progress > 0 && (
                <div className="w-48 bg-slate-700 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="p-3 rounded-full bg-slate-700/80 text-emerald-400 group-hover:scale-105 transition-transform">
                <Upload size={22} />
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-semibold text-slate-100 group-hover:text-emerald-400 transition-colors">
                  {label}
                </p>
                <p className="text-xs text-slate-400">
                  {description}
                </p>
              </div>
              <span className="text-[11px] text-slate-400 mt-1 bg-slate-700/60 px-2 py-0.5 rounded-md">
                Clique para selecionar ou arraste até aqui
              </span>
            </>
          )}
        </div>
      </div>

      {/* Feedback de Erro */}
      {errorMessage && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Falha no upload</p>
            <p className="text-rose-400/90">{errorMessage}</p>
          </div>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setErrorMessage(''); }}
            className="text-rose-400 hover:text-rose-200 p-0.5"
            title="Fechar"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Feedback de Sucesso */}
      {successMessage && (
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
          <CheckCircle2 size={16} className="shrink-0" />
          <span className="flex-1 font-medium">{successMessage}</span>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setSuccessMessage(''); }}
            className="text-emerald-400 hover:text-emerald-200 p-0.5"
            title="Fechar"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Pré-visualização da imagem enviada ou atual */}
      {showPreview && previewUrl && (
        <div className="p-3 bg-slate-800/90 border border-slate-700 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
            <span className="flex items-center gap-1.5">
              <ImageIcon size={14} className="text-emerald-400" />
              Pré-visualização
            </span>
            <div className="flex items-center gap-2">
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition"
                title="Abrir imagem original"
              >
                <ExternalLink size={13} />
                <span className="text-[11px]">Abrir link</span>
              </a>
              {!disabled && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="text-rose-400 hover:text-rose-300 flex items-center gap-1 transition text-[11px]"
                  title="Remover imagem"
                >
                  <X size={13} />
                  <span>Remover</span>
                </button>
              )}
            </div>
          </div>

          <div className="relative rounded-lg overflow-hidden border border-slate-700/80 bg-slate-900/50 flex items-center justify-center max-h-56">
            <img
              src={previewUrl}
              alt="Pré-visualização"
              className="max-h-56 w-auto object-contain rounded-lg"
              onError={() => {
                // Silently handle broken image links
              }}
            />
          </div>

          <p className="text-[11px] text-slate-400 truncate font-mono bg-slate-900/40 p-1.5 rounded">
            {previewUrl}
          </p>
        </div>
      )}
    </div>
  );
}
