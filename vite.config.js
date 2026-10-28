import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import crypto from 'node:crypto'
import process from 'node:process'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'imagekit-auth-mock-server',
        configureServer(server) {
          server.middlewares.use('/api/imagekit-auth', (req, res) => {
            const token = crypto.randomUUID()
            const expire = Math.floor(Date.now() / 1000) + 2400
            const privateKey = env.IMAGEKIT_PRIVATE_KEY || env.VITE_IMAGEKIT_PRIVATE_KEY

            let signature = `mock_sig_${crypto.randomBytes(8).toString('hex')}`
            if (privateKey) {
              signature = crypto
                .createHmac('sha1', privateKey)
                .update(token + expire)
                .digest('hex')
            }

            res.writeHead(200, {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            })
            res.end(JSON.stringify({ signature, expire, token }))
          })
        }
      }
    ],
  }
})
