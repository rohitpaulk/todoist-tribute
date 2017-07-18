var path = require('path');

module.exports = {
  entry: './src/index.ts',
  devServer: {
    contentBase: './dist'
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      'handlebars': 'handlebars/dist/handlebars.js',
      'vue': 'vue/dist/vue.js' // Include the template compiler
    }
  },
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          'style-loader',
          'css-loader',
          'sass-loader'
        ]
      },
      {
        test: /\.ts$/,
        use: 'ts-loader',
      }
    ]
  }
};
