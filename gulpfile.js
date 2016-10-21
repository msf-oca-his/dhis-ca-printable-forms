var gulp        = require('gulp'),
    clean       = require('gulp-clean'),
    browserSync = require('browser-sync').create(),
    gulpsync    = require('gulp-sync')(gulp),
    proxy       = require('http-proxy-middleware'),
    KarmaServer = require('karma').Server,
    webpack     = require('webpack'),
    zip         = require('gulp-zip'),
		chmod       = require('gulp-chmod'),
		sass        = require('gulp-sass');

APP = {
	src: {
		root: "src",
		all: "src/**/*.*",
		html: "src/**/*.html",
		js: "src/**/*.js",
		scss:"src/scss/*.scss"
	},
	dependencies: {
		root: 'dependencies',
		bower_components: {
			root: 'dependencies/bower_components',
			all: 'dependencies/bower_components/**/*.*',
			bootstrap:{
				fonts: {
					all: "dependencies/bower_components/bootstrap/dist/fonts/*.*"
				}
			}
		}
	},
	resources: {
		root: "resources",
		all: "resources/**/*.*",
		img: "resources/img"
	},
	i18n: {
		root: "i18n",
		all: "i18n/**/*.*"
	},
	appManifest: {
		manifest: "manifest.webapp"
	},
	webpack: {
		config: "./webpack.config.js",
	},
	tests: {
		root: 'tests',
		testsSrc: 'tests/!(.temp|coverage)/*.js',
		temp: {
			root: './tests/.temp'
		},
		webpack: {
			config: './tests/webpack.config.js'
		}
	}
};

DEST = {
	target: "target",
	prodZip: "print_tally_sheets.zip"
};

TEMP = {
	root: ".temp",
	css:".temp/css",
	all: ".temp/**/*.*",
	resources: ".temp/resources",
	fonts: ".temp/fonts"

};

GitHooks = {
	scripts:{
		all: "githooks/*"
	},
	defaultFolder: {
		root: ".git/hooks/"
	}

};

TASKS = {
	watchSrc: '_watchSrc',
	cleanTemp: '_cleanTemp',
	cleanTarget: '_cleanTarget',
	clean: 'clean',
	serve: 'serve',
	compileScss: 'compileScss',
	copyResourcesToTemp: '_copyResourcesToTemp',
	setUpTemp: '_setUpTemp',
	reload: '_reload',
	webpack: 'webpack',
	webpackTest: '_webpackTest',
	pack: 'pack',
	test: 'test',
	setupGitHooks: 'setupGitHooks',
	setProdEnv: '_setProdEnv'
};

gulp.task(TASKS.setupGitHooks, function(){
	gulp.src(GitHooks.scripts.all)
		.pipe(chmod(700))
		.pipe(gulp.dest(GitHooks.defaultFolder.root))
});

gulp.task(TASKS.clean, [TASKS.cleanTemp, TASKS.cleanTarget]);

gulp.task(TASKS.cleanTemp, function() {
	return gulp.src(TEMP.root, {read: false})
		.pipe(clean())
});

gulp.task(TASKS.cleanTarget, function() {
	return gulp.src(DEST.target, {read: false})
		.pipe(clean())
});

gulp.task(TASKS.compileScss, function() {
	gulp.src([APP.dependencies.bower_components.bootstrap.fonts.all])
		.pipe(gulp.dest(TEMP.fonts));
	return gulp.src([APP.src.scss])
		.pipe(sass())
		.pipe(gulp.dest(TEMP.css))
		.on('error', function(error) {
			console.log(error);
		});
});

gulp.task(TASKS.copyResourcesToTemp, [], function() {
	return gulp.src(APP.resources.all)
		.pipe(gulp.dest(TEMP.resources))
});

gulp.task(TASKS.reload, function() {
	browserSync.reload();
});

gulp.task(TASKS.watchSrc, function() {
	gulp.watch([APP.src.html, APP.src.js,APP.i18n.all], gulpsync.sync([TASKS.webpack, TASKS.reload]));
	gulp.watch(APP.src.scss, gulpsync.sync([TASKS.compileScss, TASKS.reload]));
	gulp.watch(APP.resources.all, gulpsync.sync([TASKS.copyResourcesToTemp, TASKS.reload]))
});


gulp.task(TASKS.setUpTemp, gulpsync.sync([TASKS.cleanTemp, TASKS.webpack,TASKS.compileScss, TASKS.copyResourcesToTemp]))

gulp.task(TASKS.serve, [TASKS.setUpTemp], function() {
	browserSync.init({
		port: 8000,
		server: {
			port: 8000,
			baseDir: TEMP.root,
			middleware: [proxy(['/api', '/dhis-web-commons', '/icons'], {target: 'http://localhost:8080'})]
		}

	});
});

gulp.task(TASKS.webpack, function(callback) {
	webpack(require(APP.webpack.config), function(err, stats) {
		if(err) {
			console.log("error while doing webpack", err)
		}
		callback();
	});
});

gulp.task(TASKS.test, gulpsync.sync([TASKS.setUpTemp]), function(done) {
	new KarmaServer({
		configFile: __dirname + '/tests/karma.conf.js',
		singleRun: true
	}, function(err) {
		if(err == 1) {
			console.error("unit tests have failed...");
			process.exit(1);
		}
		else
			done();
	}).start();
});

gulp.task(TASKS.setProdEnv, function() {
	process.env.NODE_ENV = 'production';
});

gulp.task(TASKS.pack, [ TASKS.setProdEnv, TASKS.setUpTemp ], function() {
	return gulp.src([TEMP.all, APP.appManifest.manifest])
		.pipe(zip(DEST.prodZip))
		.pipe(gulp.dest(DEST.target));
});

gulp.task('default', [TASKS.serve, TASKS.watchSrc]);