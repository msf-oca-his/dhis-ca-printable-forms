module.exports = {
    entry: {
        tests : "./tests/tests.js",
    },
    output: {
        path: './tests/.temp',
        filename: "[name].js"
    },
    module:{
        loaders:  [{ test: /\.html$/, loader: "raw-loader" }]
    }
};
