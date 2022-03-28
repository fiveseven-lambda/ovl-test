const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const WasmPackPlugin = require('@wasm-tool/wasm-pack-plugin');
const webpack = require('webpack');

module.exports = {
  entry: './ts/index.ts',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
      },
    ],
  },
  resolve: {
    extensions: [ '.ts', '.js' ],
    fallback: {
      stream: require.resolve('stream-browserify'),
      buffer: require.resolve('buffer'),
    },
  },
  plugins: [
    new CopyPlugin({
      patterns: [
          path.resolve(__dirname, 'static'),
      ],
    }),
    new WasmPackPlugin({
      crateDirectory: __dirname,
    }),
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser',
    }),
  ],
  experiments: {
    asyncWebAssembly: true,
  },
};
