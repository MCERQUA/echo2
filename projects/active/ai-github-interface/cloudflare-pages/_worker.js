// This worker handles API routes for Cloudflare Pages
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Forward API requests to the main worker
    if (url.pathname.startsWith('/api/')) {
      const apiUrl = `https://ai-github-api.${env.CF_ACCOUNT_SUBDOMAIN}.workers.dev${url.pathname}`;
      return fetch(apiUrl, {
        method: request.method,
        headers: request.headers,
        body: request.body
      });
    }
    
    // Let Pages handle static files
    return env.ASSETS.fetch(request);
  }
};