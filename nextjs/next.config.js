// next.config.js
const SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin')

const withPlugins = require('next-compose-plugins')
const withSass = require('@zeit/next-sass')
const withCSS = require('@zeit/next-css')

const isProd = process.env.NODE_ENV === 'production'

module.exports = withPlugins(
  [
    withCSS,
    [withSass, {
      cssModules: true,
      cssLoaderOptions: {
        importLoaders: 1,
        localIdentName: isProd ? '[hash:base64:5]' : '[local]___[hash:base64:5]',
      },
      sassLoaderOptions: {
        sourceMap: true,
      },
      postcssLoaderOptions: {
        parser: true,
      },
    }],
  ],
  {
    poweredByHeader: false,
    webpack: (config, { dev, isServer }) => {
      const defaultConfig = {
        inlineImageLimit: 8192,
        assetPrefix: '',
      }
      const nextConfig = Object.assign(defaultConfig, config)
      // eslint-disable-next-line no-param-reassign
      config.node = {
        fs: 'empty',
      }

      config.module.rules.push({
        test: /\.svg$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: nextConfig.inlineImageLimit,
              fallback: 'file-loader',
              publicPath: `${nextConfig.assetPrefix}/_next/static/images/`,
              outputPath: `${isServer ? '../' : ''}static/images/`,
              name: '[name]-[hash].[ext]',
            },
          },
          {
            loader: 'svgo-loader',
            options: {
              plugins: [
                { removeTitle: true },
                { convertColors: { shorthex: false } },
                { convertPathData: false },
              ],
            },
          },
        ],
      })

      // for development
      // ---------------------------------
      if (dev) {
        // for eslint
        // config.module.rules.push({
        //   test: /\.js$/,
        //   exclude: /(node_modules)/,
        //   loader: 'eslint-loader',
        //   options: {
        //     fix: true,
        //     // failOnError: true,
        //   },
        // })
      }

      // for production
      // ---------------------------------
      else {
        config.plugins.push(new SWPrecacheWebpackPlugin({
          verbose: true,
          staticFileGlobsIgnorePatterns: [/\.next\//],
          runtimeCaching: [{
            handler: 'networkFirst',
            urlPattern: /^https?.*/,
          }],
        }))
      }

      return config
    },
  },
)
