/*!
 * module dependencies
 */
var gulp = require('gulp');
var gutil = require('gulp-util');
var jshint = require('gulp-jshint');
var jscs = require('gulp-jscs');
var mocha = require('gulp-mocha');
var karma = require('gulp-karma');

var PATHS = require('../../paths.json');

/**
 * Server
 */
gulp.task('server-lint', function() {
  return gulp.src([
    PATHS.SERVER.APP.JS,
    PATHS.SERVER.TEST.UNIT,
    PATHS.SERVER.TEST.E2E
  ])
    .pipe(jshint({node: true}))
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jscs());
});

gulp.task('server-unit-test', function() {
  return gulp.src(PATHS.SERVER.TEST.UNIT)
    .pipe(mocha({reporter: 'spec'}));
});

gulp.task('server-e2e-test', function() {
  return gulp.src(PATHS.SERVER.TEST.E2E)
    .pipe(mocha({reporter: 'spec'}));
});

gulp.task('server-qa', [
  'server-lint',
  'server-unit-test',
  'server-e2e-test'
]);

/**
 * Client
 */
gulp.task('client-lint', function() {
  return gulp.src([
    PATHS.CLIENT.APP.JS,
    PATHS.CLIENT.TEST.UNIT,
    PATHS.CLIENT.TEST.E2E
  ])
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jscs());
});

gulp.task('client-unit-test', function() {
  return testWithKarma(PATHS.CLIENT.TEST.UNIT);
});

gulp.task('client-unit-test-watch', function() {
  return testWithKarma(PATHS.CLIENT.TEST.UNIT, true);
});

function testWithKarma(src, watch) {
  var action = watch ? 'watch' : 'run';
  var scripts = [PATHS.CLIENT.BUILD + '/app/bundle.js'].concat(src);

  var stream = gulp.src(scripts)
    .pipe(karma({
      configFile: 'karma.conf.js',
      action: action
    }));

  if (!watch) {
    stream.on('error', function(err) {
      gutil.log('karma error:', err.message);
    });
  }

  return stream;
}

// TODO: Client e2e tests with Protractor!

gulp.task('client-qa', [
  'client-lint',
  'client-unit-test'
]);

gulp.task('test', ['server-qa', 'client-qa']);
