'use strict';

var path = require('path');

var cm = module.exports = {};

// External libs.
cm.noop = function () {};

cm.date = require('dateformat');
cm.es = require('event-stream');

// Fake LoDash
cm._ = {};
cm._.after =  require('lodash.after');
cm._.assign =  require('lodash.assign');
cm._.template = require('lodash.template');

cm.pkg = require(path.resolve(process.cwd(), '../../package.json'));
cm.gutil = require('gulp-util');
cm.rename = require('gulp-rename');
cm.header = require('gulp-header');
cm.rimraf = require('gulp-rimraf');

cm.processConfig = function(str){
  return cm.template(str, cm);
};

/**
 * Apply a function on each file
 * @param fct
 * @returns {Stream}
 */
cm.applyOnFile = function(fct){
  var args = Array.prototype.slice.call(arguments, 1);
  return cm.es.map(function (file, cb) {
    file.contents = fct.apply(null, [file].concat(args));
    cb(null, file);
  });
};

/**
 * Process the template content of each file
 * @param options
 * @returns {Stream}
 */
cm.processTemplateFile = function(options){
  return cm.applyOnFile(function(file){
    return new Buffer(cm.gutil.template(file.contents , cm._.assign({file : file}, cm, options) ));
  });
};

/**
 * Apply a function on the content of each files
 * @param fct
 * @returns {Stream}
 */
cm.applyOnFileContent = function(fct){
  var args = Array.prototype.slice.call(arguments, 1);
  return cm.es.map(function (file, cb) {
    file.contents = fct.apply(null, [file.contents].concat(args));
    cb(null, file);
  });
};

/**
 * Get a formatted now date
 * @param format
 * @returns {String}
 */
cm.today = function(format) {
  return cm.date(new Date(), format);
};