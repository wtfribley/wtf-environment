/*!
 * module dependencies
 *
 * note that the browserify require function only works with literal strings.
 */

// vendor
require('../../bower_components/angular/angular');
require('../../bower_components/angular-resource/angular-resource');
require('../../bower_components/angular-ui-router/release/angular-ui-router');
require('../../bower_components/angular-animate/angular-animate');

// application

/**
 * Application Module
 *
 * (rename this module to match the name of project in package.json, following
 * Angular's camel case normalization)
 */
angular.module('wtfEnvironment', [

  // vendor
  'ngResource',
  'ui.router',
  'ngAnimate'

  // application

])

.config(function($locationProvider) {
  $locationProvider.html5Mode(true);
});
