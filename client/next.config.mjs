/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "**.etb2bimg.com",
      },
      {
        protocol: "https",
        hostname: "img.etimg.com",
      },
      {
        protocol: "https",
        hostname: "static.etimg.com",
      },
      {
        protocol: "https",
        hostname: "images.moneycontrol.com",
      },
    ],
  },
};

export default nextConfig;

