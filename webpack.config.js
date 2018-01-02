var CopyWebpackPlugin = require('copy-webpack-plugin');
var webpack = require('webpack');
var path = require('path');
module.exports = {
	entry: {
		dependencies: "./src/dependencies.js",
		factories: "./src/factories.js",
		services: "./src/services.js",
		directives: "./src/directives.js",
		app: "./src/app.js",
		utils: "./src/utils.js",
		'pff-model': "./src/pff-model.js",
		translationsSetup: "./src/translationsSetup.js",
		boot: "./src/boot.js"
	},
	plugins: [
		new CopyWebpackPlugin([
			// {output}/file.txt
			// { from: './src/app.js', to: './app.js' },
			{from: './src/config/config.js', to: './config.js'},
			{from: './src/config/CalculatedConfig.js', to: './calculatedConfig.js'},
			{from: './src/index.html', to: './index.html'}
		]),
		new webpack.DefinePlugin({
			'process.env': {
				'NODE_ENV': JSON.stringify(process.env.NODE_ENV)
			}
		})],

	output: {
		path: path.join(__dirname, ".temp"),
		filename: "[name].js"
	},
	module: {
		rules: [{
            test: /\.html$/,
			use: [
				{
					loader: "raw-loader"
				}
			]
		}]
	}
};
