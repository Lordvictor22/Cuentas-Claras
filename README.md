# Nuestro Hogar

Aplicativo familiar para organizar os gastos da casa, acompanhar aportes e dividir o fundo compartilhado.

## Executar localmente

1. Instale as dependências com `npm install`.
2. Configure as variáveis `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID` e `VITE_FIREBASE_APP_ID` em `.env.local`.
3. Execute `npm run dev`.

## Fotos de perfil

As fotos são armazenadas no Firebase Storage em `avatars/{integrante}/profile`. Cada integrante autenticado pode enviar ou substituir somente a própria foto. As imagens são compartilhadas com os demais usuários autenticados e aceitam JPG, PNG ou WebP de até 5 MB.

Para ativar os uploads, habilite o Firebase Storage no projeto e publique as regras incluídas neste repositório:

```sh
firebase deploy --only storage --project SEU_PROJECT_ID
```

Substitua `SEU_PROJECT_ID` pelo valor de `VITE_FIREBASE_PROJECT_ID` em `.env.local`. As regras permitem que usuários autenticados vejam as fotos, mas limitam o envio de cada avatar ao e-mail correspondente ao integrante.
