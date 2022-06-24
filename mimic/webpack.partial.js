module.exports = {
  module: {
    rules: [
      { test: /\.(txt|md|frag|vert)$/, use:[{ loader:'raw-loader', options: {
        esModule: false,
      }}],}
    ]
}};