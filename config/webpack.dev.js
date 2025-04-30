const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
// 打包DEMO
module.exports =  {
  mode: "none",
  context: path.resolve(__dirname, "../"),
  entry: "./src/index.ts",
  output: {
    path: path.resolve(__dirname, "../dist"),
    filename: "js/bundle-[name]-[chunkhash:8].js",
    chunkFilename: "js/chunk-[name]-[chunkhash:8].js",
    clean: true,
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
  plugins: [
    new HtmlWebpackPlugin({
      inject: "body",
      template: "./template.html",
      minify: process.env.NODE_ENV === "production",
    }),
  ],
  devServer: {
    host: "0.0.0.0",
    port: 8888,
    proxy: [
      {
        context: ['/api'],             // 匹配的路径
        target: 'http://0.0.0.0:9000', // 目标服务器地址
        changeOrigin: true,            // 是否修改 Origin
      },
    ],
  },
}