/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@verifyme/api",
    "@verifyme/types",
    "@verifyme/auth",
    "@verifyme/ui",
  ],
};

module.exports = nextConfig;
