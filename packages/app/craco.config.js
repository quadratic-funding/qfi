const path = require("path");
const { getLoader, loaderByName } = require("@craco/craco");
// const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

const packages = [];
packages.push(path.join(__dirname, "../ui"));
packages.push(path.join(__dirname, "../hooks"));


module.exports = {
  webpack: {
    // plugins: [new BundleAnalyzerPlugin({ analyzerMode: "server" })],
    configure: (webpackConfig, arg) => {
      const { isFound, match } = getLoader(webpackConfig, loaderByName("babel-loader"));
      if (isFound) {
        const include = Array.isArray(match.loader.include)
          ? match.loader.include
          : [match.loader.include];

        match.loader.include = include.concat(packages);
      }

      return webpackConfig;
    },
  },
};