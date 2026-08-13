import type { NextConfig } from "next";

const securityHeaders = [
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "microphone=()",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
  env: {
    // Kinde requires these three variables to be defined. Fall back to the
    // Vercel preview URL so preview deployments get the right callback domains.
    KINDE_SITE_URL:
      process.env.KINDE_SITE_URL ??
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined),
    KINDE_POST_LOGOUT_REDIRECT_URL:
      process.env.KINDE_POST_LOGOUT_REDIRECT_URL ??
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined),
    KINDE_POST_LOGIN_REDIRECT_URL:
      process.env.KINDE_POST_LOGIN_REDIRECT_URL ??
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined),
  },
};

export default nextConfig;
