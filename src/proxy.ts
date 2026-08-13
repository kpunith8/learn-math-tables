import { withAuth } from '@kinde-oss/kinde-auth-nextjs/middleware';

// Optional login: every route is public, so the proxy never redirects. It still
// runs on every request to refresh Kinde tokens in the background. To gate a
// route later, remove it from `publicPaths`.
export default withAuth(
  async function proxy() {},
  {
    publicPaths: [
      '/',
      '/api/auth',
      '/api/name',
      '/addition',
      '/subtraction',
      '/multiplication',
      '/division',
      '/tables',
    ],
  }
);

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
  ],
};
