import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { pathToFileURL } from 'url';

/**
 * Local Development Middleware for Vercel API routes (/api/*).
 * Allows testing Vercel Serverless Functions locally during `npm run dev`.
 */
function vercelApiDevPlugin() {
  return {
    name: 'vercel-api-dev-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith('/api/')) {
          const routeName = req.url.split('?')[0].replace(/^\/api\//, '');
          const filePath = path.resolve(process.cwd(), 'api', `${routeName}.js`);
          
          try {
            const fileUrl = pathToFileURL(filePath).href;
            const apiModule = await import(/* @vite-ignore */ `${fileUrl}?t=${Date.now()}`);
            const handler = apiModule.default;
            
            if (typeof handler === 'function') {
              // Polyfill helper for express-like res.status().json() if needed locally
              if (!res.status) {
                res.status = (statusCode) => {
                  res.statusCode = statusCode;
                  return res;
                };
              }
              if (!res.json) {
                res.json = (data) => {
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify(data));
                  return res;
                };
              }
              return handler(req, res);
            }
          } catch (err) {
            console.error(`[Local API Dev Server] Error running /api/${routeName}:`, err.message);
          }
        }
        next();
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), vercelApiDevPlugin()],
});
