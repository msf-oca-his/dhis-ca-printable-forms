module.exports = {
    entry: {
        "./.temp/dependencies.js" : "./src/dependencies.js",
        "./.temp/services.js" : "./src/services/services.js",
        "./.temp/directives.js" : "./src/directives/directives.js",
        "./.temp/app.js" : "script!./src/app.js",
        "./.temp/config.js" : "script!./src/config/config.js",

    },

    output: {
        path: './',
        filename: "[name]"
    },
    module:{
        loaders:  [{ test: /\.html$/, loader: "raw-loader" }]
    }
}
