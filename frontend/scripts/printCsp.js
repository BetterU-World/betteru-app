const api = process.env.NEXT_PUBLIC_CLERK_FRONTEND_API;
const clerk = [
  'https://*.clerk.com',
  'https://*.clerk.dev',
  'https://*.clerk.accounts',
  'https://accounts.clerk.com',
];
if (api) clerk.push(`https://${api}`);
const csp = [
  "default-src 'self'",
  ["script-src 'self'", ...clerk].join(' '),
  "style-src 'self' 'unsafe-inline'",
  ["img-src 'self' data: blob:", ...clerk].join(' '),
  "font-src 'self' data:",
  ["connect-src 'self' https://api.clerk.com https://*.stripe.com", ...clerk].join(' '),
  "frame-ancestors 'none'",
  ["frame-src https://*.stripe.com", ...clerk].join(' '),
  "media-src 'self' blob:",
  "object-src 'none'",
].join('; ');
console.log(csp);
