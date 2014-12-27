/*!
 * module dependencies
 */
var fs = require('fs');
var path = require('path');
var gulp = require('gulp');
var concat = require('gulp-concat');
var minifyHtml = require('gulp-minify-html');
var ngHtml2Js = require('gulp-ng-html2js');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');

var PATHS = require('../paths.json');
var BASE = PATHS.FOUNDATION.BASE;

/**
 * Foundation for Apps build tasks
 */

gulp.task('foundation-iconic', function() {
  return gulp.src(BASE + PATHS.FOUNDATION.ICONIC)
    .pipe(gulp.dest(PATHS.CLIENT.BUILD + '/icons'));
});

gulp.task('foundation-templates', function() {
  return gulp.src(BASE + PATHS.FOUNDATION.TEMPLATES)
    .pipe(minifyHtml({
      empty: true,
      comments: true
    }))
    .pipe(ngHtml2Js({
      moduleName: 'foundation',
      declareModule: false,
      prefix: 'components/'
    }))
    .pipe(concat('foundation.templates.js'))
    .pipe(gulp.dest(PATHS.FOUNDATION.BUILD));
});

gulp.task('foundation-js', ['foundation-templates'], function() {
  var src = PATHS.FOUNDATION.DEPENDENCIES.concat(
    BASE + PATHS.FOUNDATION.JS,
    PATHS.FOUNDATION.BUILD + '/foundation.templates.js',

    // until Foundation removes their app.js file completely, this is necessary.
    '!' + BASE + 'app.js'
  );

  return gulp.src(src)
    .pipe(concat('foundation.js'))
    .pipe(gulp.dest(PATHS.FOUNDATION.BUILD));
});

gulp.task('foundation', ['foundation-js', 'foundation-iconic'], function(cb) {
  var templates = PATHS.FOUNDATION.BUILD + '/foundation.templates.js';
  fs.unlink(path.resolve(__dirname, '..', templates), cb);
});
