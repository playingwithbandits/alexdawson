/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
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
