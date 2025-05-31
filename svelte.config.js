import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      // default options are generally good for GitHub Pages
      pages: 'build', // or 'docs' - this is the output directory
      assets: 'build', // or 'docs'
      fallback: 'index.html', // or '404.html' - important for SPA routing
      precompress: false,
      strict: true
    }),
    paths: {
      // IMPORTANT: Set this to your repository name if deploying to a subdirectory
      // e.g., if your GitHub Pages URL is https://<username>.github.io/<repository-name>/
      base: process.env.NODE_ENV === 'production' ? '/fast-edh' : '',
    }
  }
};

export default config;
