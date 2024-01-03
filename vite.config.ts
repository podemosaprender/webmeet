import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'
//SEE: https://vitejs.dev/config/server-options.html#server-https

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
		react(),  
		basicSsl(), 
	],
})
