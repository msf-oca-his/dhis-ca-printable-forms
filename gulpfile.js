var gulp = require('gulp'),
  clean = require('gulp-clean'),
  browserSync = require('browser-sync').create(),
  gulpsync = require('gulp-sync')(gulp),
  proxy = require('http-proxy-middleware');
  webpack = require('webpack');

gulp.task('connect', function() {
  connect.server({
    root: APP.src.root,
    livereload: true
  });
});


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
  temp: {
    root: ".temp",
    all: "temp/**/*.*",
    dependencies: ".temp/dependencies",
    resources: ".temp/resources",
    i18n: ".temp/i18n"

  },
  test: {

  },
  dependencies: {
    root: 'dependencies',
    bower_components: {
      root: 'dependencies/bower_components',
      all: 'dependencies/bower_components/**/*.*'
    }
  }
};

DEST = {
  target: "target"
};

TASKS = {
  watch: '_watch',
  cleanTemp: '_cleanTemp',
  clean: 'clean',
  serve: 'serve',
  copySrcToTemp: '_copySrcToTemp',
  copyResourcesToTemp: '_copyResourcesToTemp',
  copyDependenciesToTemp: '_copyDependenciesToTemp',
  copyi18nToTemp: '_copyi18nToTemp',
  setUpTemp: '_setUpTemp',
  reload: '_reload',
  webpack: 'webpack'
};

gulp.task(TASKS.clean, [TASKS.cleanTemp]);

gulp.task(TASKS.cleanTemp, function(){
  return gulp.src(APP.temp.root, {read: false})
    .pipe(clean())
});

gulp.task(TASKS.copySrcToTemp, function() {
    return gulp.src([APP.src.html, APP.src.css])
      .pipe(gulp.dest(APP.temp.root))
});

gulp.task(TASKS.copyi18nToTemp, function() {
  return gulp.src(APP.i18n.all)
    .pipe(gulp.dest(APP.temp.i18n))
});


gulp.task(TASKS.copyResourcesToTemp, [], function() {
  return gulp.src(APP.resources.all)
    .pipe(gulp.dest(APP.temp.resources))
});

//TODO: remove this task once scss comes into place. Right now, js files are handled by webpack. css should be taken care by scss
gulp.task(TASKS.copyDependenciesToTemp, [], function() {
  return gulp.src(APP.dependencies.bower_components.all)
    .pipe(gulp.dest(APP.temp.dependencies))
});

gulp.task(TASKS.reload, function(){
  browserSync.reload();
});

gulp.task(TASKS.watch,  function() {
  gulp.watch(APP.src.all, gulpsync.sync([TASKS.webpack, TASKS.copySrcToTemp, TASKS.reload]))
  gulp.watch(APP.resources.all, gulpsync.sync([TASKS.copyResourcesToTemp, TASKS.reload]))
  gulp.watch(APP.i18n.all, gulpsync.sync([TASKS.copyi18nToTemp, TASKS.reload]))
});

gulp.task(TASKS.setUpTemp, gulpsync.sync([TASKS.cleanTemp, TASKS.webpack, TASKS.copySrcToTemp, TASKS.copyDependenciesToTemp, TASKS.copyResourcesToTemp, TASKS.copyi18nToTemp]))

gulp.task(TASKS.serve, [TASKS.setUpTemp], function(){
  browserSync.init({
    port: 8000,
    server: {
      port: 8000,
      baseDir: APP.temp.root,
      middleware: [proxy(['/api', '/dhis-web-commons', '/icons'], {target:'http://localhost:8080'})]
    }

  });
});

gulp.task(TASKS.webpack, function(callback) {
  webpack(require('./webpack.config.js'), function(err, stats) {
    if(err) {
      console.log("error while doing webpack", err)
    }
    callback();
  });
});
gulp.task('default', [TASKS.serve, TASKS.watch]);