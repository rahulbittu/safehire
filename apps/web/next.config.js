/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@verifyme/api",
    "@verifyme/types",
    "@verifyme/auth",
    "@verifyme/ui",
  ],
  // TODO: Add image domains for worker photos once storage is configured
  // images: {
  //   domains: ['your-supabase-project.supabase.co'],
  // },
};

module.exports = nextConfig;
