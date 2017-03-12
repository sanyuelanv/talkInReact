var path = require('path');
var node_module_dir = path.resolve(__dirname, 'node_module')
var webpack = require('webpack')
process.traceDeprecation = true
module.exports = {
  entry: {
    app:path.resolve(__dirname, 'dev/main.js'),
  },
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'app.js'
  },
  plugins: [
    new webpack.DefinePlugin({__DEV__: JSON.stringify(JSON.parse(process.env.BUILD_DEV || 'true'))}),
    new webpack.optimize.UglifyJsPlugin({
      drop_console: true,
      minimize: true,
      output: {
        comments: false
      },
      compress: {
        warnings: false,
        drop_debugger: true,
        drop_console: true
      }
    }),
  ],
  module:{
    rules:[
      {
        loader: "babel-loader",
        include: [path.resolve(__dirname, 'dev')],
        exclude: [node_module_dir],
        test: /\.js?$/,
        options: {
          plugins:['transform-runtime',"transform-decorators-legacy","transform-class-properties"],
          presets: ['es2015', 'stage-0', 'react']
        }
      }
    ]
  }
}
