/*!
 * module dependencies
 */
var gulp = require('gulp');
var gutil = require('gulp-util');
var livereload = require('gulp-livereload');
var spawn = require('child_process').spawn;

var PATHS = require('./paths.json');

/**
 * QA
 */
require('./gulp/qa');

/**
 * Build
 */
require('./gulp/build');

/**
 * Development
 */

// Application Server
var appServer;

gulp.task('server', function() {
  if (appServer) appServer.kill();

  appServer = spawn('node', [PATHS.SERVER.APP.ENTRY], {stdio: 'inherit'});

  appServer.on('close', function(code) {
    if (code != 143) {
      gutil.log('Application server stopped with code: ' + code);
      gutil.log('The server will restart when you change a file.');
    }
  });
});

// Watch & Build & Reload
gulp.task('watch', ['watchify'/*, 'client-unit-test-watch'*/], function() {

  livereload.listen();

  gulp.watch([
    PATHS.SERVER.APP.JS,
    PATHS.SERVER.TEST.UNIT,
    PATHS.SERVER.TEST.E2E
  ], ['server-qa', 'server']);

  // watching for tests is handled "natively" by Karma.
  // TODO: client e2e test watching.
  gulp.watch([
    PATHS.CLIENT.APP.JS,
    PATHS.CLIENT.TEST.UNIT,
    PATHS.CLIENT.TEST.E2E
  ], ['client-lint']);

  gulp.watch(PATHS.CLIENT.FONTS, ['fonts']);
  gulp.watch(PATHS.CLIENT.IMAGES, ['images']);
  gulp.watch([PATHS.CLIENT.SASS.APP, PATHS.CLIENT.SASS.INCLUDES], ['sass']);
  gulp.watch(PATHS.CLIENT.TEMPLATES, ['templates']);
  gulp.watch(PATHS.CLIENT.VIEWS + '/*.html', function(evt) {
    livereload.changed(evt.path);
  });
});

gulp.task('default', ['test', 'build', 'server', 'watch']);

/*!
 * no zombie servers!
 */
process.on('exit', function() {
  if (appServer) appServer.kill();
  if (livereload.server) livereload.server.close();
});
