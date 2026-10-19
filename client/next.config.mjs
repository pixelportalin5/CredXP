/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      // Old campaign URL for Spaze Corporate Park (the homepage "Property of the Month").
      // Not linked anywhere in this codebase; Googlebot keeps requesting it.
      { source: "/spaze-cp", destination: "/", permanent: true },
    ];
  },
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
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;

