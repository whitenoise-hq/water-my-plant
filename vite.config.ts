import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import aitDevtools from "@apps-in-toss/devtools/unplugin";

import packageJson from "./package.json";

export default defineConfig({
  plugins: [aitDevtools.vite(), react()],
  // 설정 화면에 앱 버전을 보여줘요.
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version),
  },
})
