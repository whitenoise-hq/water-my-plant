/// <reference types="vite/client" />

declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}

// vite.config.ts의 define으로 넣는 package.json 버전
declare const __APP_VERSION__: string;
