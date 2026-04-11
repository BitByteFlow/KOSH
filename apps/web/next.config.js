/** @type {import('next').NextConfig} */

const nextConfig = {
	transpilePackages: ["@kosh/ui"],
    turbopack: {
      rules: {
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
