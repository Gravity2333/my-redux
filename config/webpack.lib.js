const path = require("path");
const CSSMinimizerWebpackPlugin = require('css-minimizer-webpack-plugin')
const TerserWebpackPlugin = require('terser-webpack-plugin');

// 打包MyAxios lib
module.exports = {
  mode: "production",
  context: path.resolve(__dirname, "../"),
  entry: "./src/lib/MyAxios.ts",
  output: {
    path: path.resolve(__dirname, "../build"),
    filename: "bundle.js",
    chunkFilename: "chunk-[name]-[chunkhash:8].js",
    clean: true,
    library: {
      type: 'module'
    },
  },
  experiments: {
    outputModule: true
  },
  resolve: {
    mainFiles: ["index"],
    extensions: [".ts", ".tsx", ".js", ".jsx"],
    descriptionFiles: ["package.json"],
    mainFields: ["main"],
    modules: ["./lib", "../node_modules"],
    alias: {
      "@": path.resolve(__dirname, "../src"),
    },
  },
  module: {
    rules: [
      {
        test: /\.ts|tsx/,
        use: ["ts-loader"],
      },
    ],
  },
}
