import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';
  return {
    plugins: [tailwindcss(), sveltekit()],
    base: isProduction ? '/fast-edh/' : '/', // Match kit.paths.base
  }
});
