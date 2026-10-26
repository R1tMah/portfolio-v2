// Basic auth in front of the deployed /admin editor (page and API).
// The content-api function checks the same credentials itself, so the API
// stays locked even if called by its /.netlify/functions/ URL directly.
export default async (request, context) => {
  const username = Netlify.env.get('ADMIN_USERNAME');
  const password = Netlify.env.get('ADMIN_PASSWORD');
  const header = request.headers.get('authorization') ?? '';

  if (username && password && header.startsWith('Basic ')) {
    const decoded = new TextDecoder().decode(Uint8Array.from(atob(header.slice(6)), c => c.charCodeAt(0)));
    const i = decoded.indexOf(':');
    if (i >= 0 && decoded.slice(0, i) === username && decoded.slice(i + 1) === password) {
      return context.next();
    }
  }

  return new Response('Authentication required', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Portfolio editor", charset="UTF-8"' },
  });
};

export const config = { path: ['/admin', '/admin/*'] };
