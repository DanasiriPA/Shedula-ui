// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "randomuser.me",
        pathname: "/api/portraits/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "i.postimg.cc",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "api.dicebear.com",
        pathname: "/**",
      },
      {
        protocol: "https", // Added for placehold.co
        hostname: "placehold.co", // Added for placehold.co
        pathname: "/**", // Allows all paths from this hostname
      },
      {
        hostname: 'i.pravatar.cc',
      },
      // If you have other external image hosts, add them here
      {
        hostname: 'i.postimg.cc',
      },
    ],
  },
};

module.exports = nextConfig;