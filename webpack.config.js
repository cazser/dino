const path = require('path');

module.exports = {
  entry: './js/entry.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  mode: "development",
   externals: {
    window: 'window',
    document: 'document',
    parseInt: 'parseInt',
    requestAnimationFrame: 'requestAnimationFrame',
    cancelAnimationFrame :"cancelAnimationFrame",
    setInterval:"setInterval",
    AudioContext:"AudioContext",
  },
};