(function() {
  'use strict';

  /*!
   * module dependencies
   */
  var angular = require('angular');

  /**
   * Application Module
   *
   * (rename this module to match the name of project in package.json, following
   * Angular's camel case normalization)
   */
  angular.module('wtfEnvironment', [

    // vendor
    require('angular-resource'),
    require('angular-ui-router'),
    require('angular-animate')

    // application

  ])

  .config(function($locationProvider) {
    $locationProvider.html5Mode(true);
  });

})();
