const path = require('path')
const HTMLWebpackPlugin = require('html-webpack-plugin')
const WasmPackPlugin = require('@wasm-tool/wasm-pack-plugin');

module.exports = {
  entry: path.resolve(__dirname, 'src/app.tsx'),
  resolve: {
    extensions: ['.ts', '.tsx', '...'],
    fallback: {}
  },
  module: {
    rules: [
      {
        test: [/\.ts$/, /\.tsx$/],
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                '@babel/preset-env',
                '@babel/preset-react'
              ]
            }
          },
          'ts-loader'
        ]
      }, {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  plugins: [
    new HTMLWebpackPlugin({
      template: path.resolve(__dirname, 'src/index.html')
    }),
    new WasmPackPlugin({
      crateDirectory: path.resolve(__dirname, 'p_value'),
      outDir: path.resolve(__dirname, 'pkg'),
    }),
  ],
  experiments: {
    asyncWebAssembly: true,
  },
}