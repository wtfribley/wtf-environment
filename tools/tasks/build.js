/*!
 * module dependencies
 */
var gulp = require('gulp');
var gutil = require('gulp-util');

var babel = require('gulp-babel');
var babelify = require('babelify');
var browserify = require('browserify');
var buffer = require('vinyl-buffer');
var concat = require('gulp-concat');
var livereload = require('gulp-livereload');
var minifyCss = require('gulp-minify-css');
var minifyHtml = require('gulp-minify-html');
var ngHtml2Js = require('gulp-ng-html2js');
var rename = require('gulp-rename');
var sass = require('gulp-sass');
var sassDeps = require('../plugins/gulp-sass-deps');
var source = require('vinyl-source-stream');
var uglify = require('gulp-uglify');
var watchify = require('watchify');

var PACKAGE = require('../../package.json');
var PATHS = require('../../paths.json');

/**
 * Babel (for server-side ES6)
 */
gulp.task('babel', function() {
  return gulp.src(PATHS.SERVER.APP.JS)
    .pipe(babel())
    .pipe(gulp.dest(PATHS.SERVER.BUILD));
})

/**
 * Browserify
 *
 * (with watching via Watchify & ES6 via babelify)
 */
var bundler;

gulp.task('browserify-bundler', function() {
  bundler = browserify({debug: true});
});

gulp.task('browserify', ['browserify-bundler'], function() {
  return rebundle();
});

gulp.task('watchify-bundler', function() {
  watchify.args.debug = true;
  bundler = watchify(browserify(watchify.args));
});

gulp.task('watchify', ['watchify-bundler'], function() {
  bundler.on('update', rebundle);
});

function rebundle() {
  return bundler
    .transform(babelify.configure({
      blacklist: ['es6.modules']
    }))
    .require('./' + PATHS.CLIENT.APP.ENTRY, {entry: true})
    .bundle()
    .on('error', function(err) {
      gutil.log('browserify error:', err.message);
    })
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(gulp.dest(PATHS.CLIENT.BUILD + '/app'))
    .pipe(livereload())
    .pipe(rename('bundle.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest(PATHS.CLIENT.BUILD + '/app'));
}

/**
 * Fonts
 */
gulp.task('fonts', function() {
  return gulp.src(PATHS.CLIENT.FONTS)
    .pipe(gulp.dest(PATHS.CLIENT.BUILD + '/font'))
    .pipe(livereload());
});

/**
 * Images
 */
gulp.task('images', function() {
  return gulp.src(PATHS.CLIENT.IMAGES)
    .pipe(gulp.dest(PATHS.CLIENT.BUILD + '/img'))
    .pipe(livereload());
});

/**
 * SASS
 */
gulp.task('sass', function() {
  return gulp.src(PATHS.CLIENT.SASS.APP)
    .pipe(sassDeps({
      // prevent gulp.watch from calling this task twice.
      maintainEntryFile: false
    }))
    .pipe(sass({
      includePaths: PATHS.CLIENT.SASS.INCLUDES || [],
      outputStyle: 'nested',
      errLogToConsole: true
    }))
    .pipe(gulp.dest(PATHS.CLIENT.BUILD + '/css'))
    .pipe(livereload())
    .pipe(concat('app.min.css'))
    .pipe(minifyCss())
    .pipe(gulp.dest(PATHS.CLIENT.BUILD + '/css'));
});

/**
 * Templates
 *
 * Any HTML templates (aka partials) used by Angular are minified, added to
 * Angular's templateCache and saved as templates.js -- this file should be
 * sourced via a <script> tag AFTER the main bundle.js.
 */
gulp.task('templates', function() {

  function camelCase(name) {
    return name
      .replace(/([\:\-\_]+(.))/g, function(m, sep, letter, offset) {
        return offset === 0 ? letter : letter.toUpperCase();
      });
  }

  return gulp.src(PATHS.CLIENT.TEMPLATES)
    .pipe(minifyHtml({
      empty: true,
      comments: true
    }))
    .pipe(ngHtml2Js({

      // save the templates to a module matching the name of the project in
      // package.json, following Angular's camel case normalization.
      moduleName: camelCase(PACKAGE.name),
      declareModule: false
    }))
    .pipe(concat('templates.js'))
    .pipe(gulp.dest(PATHS.CLIENT.BUILD + '/app'))
    .pipe(livereload())
    .pipe(rename('templates.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest(PATHS.CLIENT.BUILD + '/app'));
});

/**
 * Build
 */
gulp.task('server-build', ['babel']);

gulp.task('client-build', [
  'babel',
  'browserify',
  'fonts',
  'images',
  'sass',
  'templates'
]);

gulp.task('build', ['server-build', 'client-build']);
