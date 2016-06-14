var path = require('path');
var webpack = require('webpack');

module.exports = {
    entry: './src/main.js',
    output: {
        path: __dirname + '/dist',
        filename: 'tngl.js',
        libraryTarget: 'umd'
    },
    module: {
      loaders: [
        {
          loader: "babel-loader",
          include: [
            path.resolve(__dirname, "src"),
          ],
          test: /\.jsx?$/,
          query: {
            presets: ['es2015'],
          }
        }
      ]
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            compress: { warnings: false }
        })
    ]
};
