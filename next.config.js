/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  distDir: "build",
  async rewrites() {
    return [
      {
        source: "/getP.php",
        destination: "https://alexdawson.co.uk/getP.php",
        // Only apply this rewrite in development
        has: [
          {
            type: "query",
            key: "q",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
