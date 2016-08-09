// Karma configuration
// Generated on Wed May 11 2016 15:49:42 GMT+0530 (IST)

module.exports = function(config) {
	config.set(
		{

			// base path that will be used to resolve all patterns (eg. files, exclude)
			basePath: '',

			// frameworks to use
			// available frameworks: https://npmjs.org/browse/keyword/karma-adapter
			frameworks: ['jasmine'],

			// list of files / patterns to load in the browser
			files: [
				'../.temp/dependencies.js',
				'../dependencies/bower_components/angular-mocks/angular-mocks.js',
				'../../custom_app_commons/js/angular-commons/tests/test-utility/*.js',
				'../tests/test-utility/*.js',
				'../.temp/app.js',
				'../.temp/services.js',
				'../.temp/directives.js',
				'../.temp/pff-model.js',
				'../tests/!(coverage)/*.js',
			],

			// list of files to exclude
			exclude: [],

			// preprocess matching files before serving them to the browser
			// available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
			preprocessors: {
				'../.temp/services.js'  : 'coverage',
				'../.temp/directives.js': 'coverage',
				'../.temp/app.js'       : 'coverage',
				'../.temp/config.js'    : 'coverage'
			},

			// test results reporter to use
			// possible values: 'dots', 'progress'
			// available reporters: https://npmjs.org/browse/keyword/karma-reporter
			reporters: ['progress', 'coverage'],

			// web server port
			port: 9876,

			// enable / disable colors in the output (reporters and logs)
			colors: true,

			// level of logging
			// possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
			logLevel: config.LOG_INFO,

			// enable / disable watching file and executing tests whenever any file changes
			autoWatch: true,

			// start these browsers
			// available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
			browsers: ['Chrome'],

			// Continuous Integration mode
			// if true, Karma captures browsers, runs the tests and exits
			singleRun: false,

			// Concurrency level
			// how many browser should be started simultaneous
			concurrency: Infinity
		}
	)
};
