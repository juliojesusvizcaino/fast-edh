import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { sveltePhosphorOptimize } from "phosphor-svelte/vite";

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';
  return {
    plugins: [sveltePhosphorOptimize(), tailwindcss(), sveltekit()],
    base: isProduction ? '/fast-edh/' : '/', // Match kit.paths.base
  }
});
