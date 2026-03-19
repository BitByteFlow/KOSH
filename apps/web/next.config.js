/** @type {import('next').NextConfig} */

const nextConfig = {
	transpilePackages: ["@kosh/ui"],
    turbopack: {
      rules: {
        // This tells Turbopack how to handle SVG files
        '*.svg': {
          loaders: [
            {
              loader: '@svgr/webpack',
              options: {
                prettier: false,
                svgo: true,
                svgoConfig: {
                  plugins: [{ name: 'preset-default', params: { overrides: { removeViewBox: false } } }],
                },
                titleProp: true,
              },
            },
          ],
          as: '*.js',
        },
      },
    },
  // Keep the webpack config as a fallback for production builds 
  // (Next.js currently uses Webpack for 'next build' in some environments)
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ['@svgr/webpack'],
    });
    return config;
  },
};

export default nextConfig;
