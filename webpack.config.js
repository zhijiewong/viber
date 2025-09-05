const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  target: 'node',
  mode: 'none',
  entry: './src/extension.ts',
  output: {
    path: path.resolve(__dirname, 'out'),
    filename: 'extension.js',
    libraryTarget: 'commonjs2'
  },
  externals: {
    vscode: 'commonjs vscode',
    playwright: 'commonjs playwright',
    'playwright-core': 'commonjs playwright-core',
    handlebars: 'commonjs handlebars'
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader'
          }
        ]
      },
      // Exclude browser assets from Playwright that shouldn't be bundled
      {
        test: /\.(css|html|svg|ttf|woff|woff2|eot)$/,
        include: /node_modules\/playwright/,
        use: 'null-loader'
      }
    ]
  },
  devtool: 'nosources-source-map',
  infrastructureLogging: {
    level: "log",
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: 'src/webview/libs',
          to: 'webview/libs'
        }
      ]
    })
  ]
};