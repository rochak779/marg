/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allows testing the dev server from a phone/tablet on the same LAN
  // (Next.js blocks cross-origin dev-resource requests by default).
  allowedDevOrigins: ['192.168.55.107'],
};

module.exports = nextConfig;
