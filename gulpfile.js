var gulp = require('gulp'),
  clean = require('gulp-clean'),
  browserSync = require('browser-sync').create(),
  gulpsync = require('gulp-sync')(gulp),
  proxy = require('http-proxy-middleware'),
  KarmaServer = require('karma').Server,
  webpack = require('webpack'),
  zip = require('gulp-zip');

APP = {
  src: {
    root: "src",
    all: "src/**/*.*",
    html: "src/index.html",
    //js: "src/**/*.js",
    css: "src/**/*.css"
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

  test: {},
  
  dependencies: {
    root: 'dependencies',
    bower_components: {
      root: 'dependencies/bower_components',
      all: 'dependencies/bower_components/**/*.*'
    }
  }
};

DEST = {
  target: "target",
  prodZip: "print_tally_sheets.zip"
};

TEMP = {
  root: ".temp",
  all: ".temp/**/*.*",
  dependencies: ".temp/dependencies",
  resources: ".temp/resources",
  i18n: ".temp/i18n"

};

TASKS = {
  watch: '_watch',
  cleanTemp: '_cleanTemp',
  cleanTarget: '_cleanTarget',
  clean: 'clean',
  serve: 'serve',
  copySrcToTemp: '_copySrcToTemp',
  copyResourcesToTemp: '_copyResourcesToTemp',
  copyDependenciesToTemp: '_copyDependenciesToTemp',
  copyi18nToTemp: '_copyi18nToTemp',
  setUpTemp: '_setUpTemp',
  reload: '_reload',
  webpack: 'webpack',
  pack: 'pack',
  test: 'test'

};

gulp.task(TASKS.clean, [ TASKS.cleanTemp, TASKS.cleanTarget ]);

gulp.task(TASKS.cleanTemp, function() {
  return gulp.src(TEMP.root, { read: false })
    .pipe(clean())
});

gulp.task(TASKS.cleanTarget, function() {
  return gulp.src(DEST.target, { read: false })
    .pipe(clean())
});


//TODO: the css part will go away when css preprocessor setup will happen. And only index.html will be copied. Rest of the htmls/js are taken care by webpack [common/local]
gulp.task(TASKS.copySrcToTemp, function() {
  return gulp.src([ APP.src.html, APP.src.css ])
    .pipe(gulp.dest(TEMP.root))
});

gulp.task(TASKS.copyi18nToTemp, function() {
  return gulp.src(APP.i18n.all)
    .pipe(gulp.dest(TEMP.i18n))
});


gulp.task(TASKS.copyResourcesToTemp, [], function() {
  return gulp.src(APP.resources.all)
    .pipe(gulp.dest(TEMP.resources))
});

//TODO: remove this task once scss comes into place. Right now, js files are handled by webpack. css should be taken care by scss
gulp.task(TASKS.copyDependenciesToTemp, [], function() {
  return gulp.src(APP.dependencies.bower_components.all)
    .pipe(gulp.dest(TEMP.dependencies))
});


gulp.task(TASKS.reload, function() {
  browserSync.reload();
});

gulp.task(TASKS.watch, function() {
  gulp.watch(APP.src.all, gulpsync.sync([ TASKS.webpack, TASKS.copySrcToTemp, TASKS.reload ]))
  gulp.watch(APP.resources.all, gulpsync.sync([ TASKS.copyResourcesToTemp, TASKS.reload ]))
  gulp.watch(APP.i18n.all, gulpsync.sync([ TASKS.copyi18nToTemp, TASKS.reload ]))
});

gulp.task(TASKS.setUpTemp, gulpsync.sync([ TASKS.cleanTemp, TASKS.webpack, TASKS.copySrcToTemp, TASKS.copyDependenciesToTemp, TASKS.copyResourcesToTemp, TASKS.copyi18nToTemp ]))

gulp.task(TASKS.serve, [ TASKS.setUpTemp ], function() {
  browserSync.init({
    port: 8000,
    server: {
      port: 8000,
      baseDir: TEMP.root,
      middleware: [ proxy([ '/api', '/dhis-web-commons', '/icons' ], { target: 'http://localhost:8080' }) ]
    }

  });
});

gulp.task(TASKS.webpack, function(callback) {
  webpack(require('./webpack.config.js'), function(err, stats) {
    if( err ) {
      console.log("error while doing webpack", err)
    }
    callback();
  });
});


gulp.task(TASKS.test, function(done) {
  new KarmaServer({
    configFile: __dirname + '/tests/karma.conf.js',
    singleRun: false
  }, done).start();
});

gulp.task(TASKS.pack, [ TASKS.setUpTemp ], function() {
  return gulp.src([ TEMP.all, APP.appManifest.manifest ])
    .pipe(zip(DEST.prodZip))
    .pipe(gulp.dest(DEST.target));
});

gulp.task('default', [ TASKS.serve, TASKS.watch ]);