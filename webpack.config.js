const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = [
  {
    mode: "development",
    context: path.resolve(__dirname, "./"),
    entry: "./src/index.ts",
    output: {
      path: path.resolve(__dirname, "./dist"),
      filename: "index.js",
      chunkFilename: "chunk-[name]-[chunkhash:8].js",
      clean: true,
      libraryTarget: "umd",
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
      new CopyWebpackPlugin({
        patterns: [
          {
            from: "./package.bundle.json",
            to: "./package.json",
          },
        ],
      }),
    ],
  },
  {
    mode: "development",
    context: path.resolve(__dirname, "./"),
    entry: "./src/index.ts",
    output: {
      path: path.resolve(__dirname, "./dist"),
      filename: "index.esm.js",
      chunkFilename: "chunk-[name]-[chunkhash:8].js",
      libraryTarget: "module",
    },
    experiments: {
      outputModule: true,
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
      new CopyWebpackPlugin({
        patterns: [
          {
            from: "./package.bundle.json",
            to: "./package.json",
          },
          {
            from:'./README.md',
            to:'./'
          }
        ],
      }),
    ],
  },
];
