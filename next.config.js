/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**"
      },
      {
        protocol: "https",
        hostname: "ui-avatars.com",
        pathname: "/api/**"
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
        pathname: "/**"
      },
      {
        // Google OAuth profile pictures
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**"
      },
      {
        // RIT IMS portal profile pictures
        protocol: "https",
        hostname: "ims.ritchennai.edu.in",
        pathname: "/**"
      }
    ]
  }
};

module.exports = nextConfig;
