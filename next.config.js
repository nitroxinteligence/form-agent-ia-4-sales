/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.ANON_PUBLIC,
  },
};

module.exports = nextConfig;
