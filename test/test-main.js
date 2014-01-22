'use strict';

var tests = [];
for (var file in window.__karma__.files) {
  if (window.__karma__.files.hasOwnProperty(file)) {
    if (file.indexOf("/unit/") != -1) {
      tests.push(file);
    }
  }
}

// var tests = [
//   //"/base/test/unit/controller.js",
//   "/base/test/unit/intervalSwing.js",
//   "/base/test/unit/ordinalSwing.js",
//   "/base/test/unit/partialValueFunction.js",
//   "/base/test/unit/taskDependencies.js"]

console.log(tests);

var foundationVersion = "5.0.2";

require.config({
  paths: {
    'jQuery': 'bower_components/jquery/jquery.min',
    'underscore': 'bower_components/underscore/underscore-min',
    'angular': 'bower_components/angular/angular.min',
    'angular-resource': 'bower_components/angular-resource/angular-resource.min',
    'angular-ui-router': 'bower_components/angular-ui-router/release/angular-ui-router.min',
    'NProgress': 'bower_components/nprogress/nprogress',
    'jquery-slider': 'lib/jslider/bin/jquery.slider.min',
    'd3': 'bower_components/d3/d3.min',
    'nvd3': 'bower_components/nvd3/nv.d3.min',
    'MathJax': 'bower_components/MathJax/MathJax.js?config=TeX-MML-AM_HTMLorMML',
    'foundation': 'bower_components/foundation/js/foundation.min',
    'jasmine': 'bower_components/jasmine/lib/jasmine-core/jasmine',
    'jasmine-html': 'bower_components/jasmine/lib/jasmine-core/jasmine-html',
    'angular-mocks': 'bower_components/angular-mocks/angular-mocks'
  },
  baseUrl: '/base/app/js',
  shim: {
    'angular': { exports : 'angular'},
    'angular-resource': { deps:['angular'], exports: 'angular-resource'},
    'angular-mocks': { deps: ['angular'], exports: 'angular.mock' },
    'underscore': { exports : '_'},
    'd3': { exports : 'd3'},
    'nvd3': { deps: ['d3'], exports : 'nv'},
    'jQuery': { exports : 'jQuery'},
    'jquery-slider': { deps: ['jQuery'] },
    'jasmine': { exports: 'jasmine' },
    'jasmine-html': { deps: ['jasmine'], exports: 'jasmine' },
    'NProgress': { deps: ['jQuery'], exports: "NProgress" },
  },
  priority: ['angular'],
  
  // ask Require.js to load these files (all our tests)
  deps: tests,

  // start test run, once Require.js is done
  callback: window.__karma__.start
});

window.name = "NG_DEFER_BOOTSTRAP!";
window.config = {
  examplesRepository: "/examples/",
  workspacesRepository: { service: "LocalWorkspaces" }
};

