const path = require('path');

module.exports = {
  resolve: {
    fallback: {
      "process": require.resolve("process/browser"),
      "path": require.resolve("browserify-path"),
      "crypto": require.resolve("browserify-crypto"),
      "stream": require.resolve("stream-browserify"),
    },
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
      {
        test: /\.(png|jpe?g|gif)$/i,
        use: [
          {
            loader: 'file-loader',
          },
        ],
      },
    ],
  },
};
