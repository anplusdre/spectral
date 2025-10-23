const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  entry: './src/renderer/app.js',
  output: {
    path: path.resolve(__dirname, 'dist/renderer'),
    filename: 'app.js',
  },
  target: 'electron-renderer',
  devtool: 'source-map',
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/renderer/index.html',
      filename: 'index.html',
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist/renderer'),
    },
    port: 8080,
    hot: true,
  },
};
