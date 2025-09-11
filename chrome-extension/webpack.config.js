const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    mode: argv.mode || 'development',
    devtool: isProduction ? false : 'cheap-module-source-map',

    entry: {
      background: './src/background/index.ts',
      content: ['./src/content/index.ts', './src/styles/tailwind.css'],
      popup: './src/popup/index.tsx',
      'devtools-panel': ['./src/devtools/panel/index.tsx', './src/styles/tailwind.css'],
      devtools: './src/devtools/index.ts'
    },

    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].js',
      clean: true,
      publicPath: ''
    },

    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/
        },
        {
          test: /\.css$/i,
          use: [
            isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader',
            'postcss-loader'
          ]
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'assets/[name][ext]'
          }
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'fonts/[name][ext]'
          }
        }
      ]
    },

    resolve: {
      extensions: ['.tsx', '.ts', '.js', '.jsx'],
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    },

    plugins: [
      new CopyPlugin({
        patterns: [
          {
            from: 'public',
            to: '.',
            globOptions: {
              ignore: ['**/manifest.json']
            }
          },
          {
            from: 'public/manifest.json',
            to: 'manifest.json',
            transform(content) {
              // You can modify manifest.json here if needed
              return content;
            }
          }
        ]
      }),

      new HtmlWebpackPlugin({
        template: 'src/popup/popup.html',
        filename: 'popup.html',
        chunks: ['popup'],
        inject: 'body'
      }),

      new HtmlWebpackPlugin({
        template: 'src/devtools/devtools.html',
        filename: 'devtools.html',
        chunks: ['devtools'],
        inject: 'body'
      }),

      new HtmlWebpackPlugin({
        template: 'src/devtools/panel/panel.html',
        filename: 'devtools-panel.html',
        chunks: ['devtools-panel'],
        inject: 'body'
      }),

      ...(isProduction ? [new MiniCssExtractPlugin({
        filename: '[name].css'
      })] : [])
    ],

    optimization: {
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all'
          }
        }
      }
    },

    devServer: {
      static: {
        directory: path.join(__dirname, 'dist')
      },
      compress: true,
      port: 3000,
      hot: false,
      liveReload: false
    },

    // Suppress handlebars require.extensions warnings
    ignoreWarnings: [
      {
        module: /node_modules\/handlebars\/lib\/index\.js$/,
        message: /require\.extensions is not supported by webpack/
      }
    ]
  };
};
