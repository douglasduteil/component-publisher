'use strict';

var cm = require('./common');
var gulp = require('gulp');
var rename = require('gulp-rename');

var DIR = cm.BUILD_DIR;

module.exports = {

  bower: function (done) {

    var almostDone = cm._.after(4, done);

    gulp.src('./branch/bower/.travis.yml')
      .pipe(gulp.dest(DIR + '/bower/'))
      .on('end', almostDone);

    gulp.src('./branch/bower/bower.tmpl.json')
      .pipe(cm.processTemplateFile())
      .pipe(rename({ext: '.json'}))
      .pipe(gulp.dest(DIR + '/bower/'))
      .on('end', almostDone);

    gulp.src('../../dist/**')
      .pipe(gulp.dest(DIR + '/bower/'))
      .on('end', almostDone);

    gulp.src('../../CHANGELOG.md')
      .pipe(gulp.dest(DIR + '/bower/'))
      .on('end', almostDone);
  },

  ghpages: function (done) {

    if (!cm.public.tocopy)  cm.public.tocopy = [];
    var almostDone = cm._.after(5 + cm.public.tocopy.length, done);

    cm.public.tocopy
      .map(function (file) {
        gulp.src('../../' + file)
          .pipe(gulp.dest(DIR + '/gh-pages/vendor'))
          .on('end', almostDone);
      });

    gulp.src('./branch/gh-pages/core/**')
      .pipe(gulp.dest(DIR + '/gh-pages/core'))
      .on('end', almostDone);
    gulp.src('./branch/gh-pages/assets/**')
      .pipe(gulp.dest(DIR + '/gh-pages/assets'))
      .on('end', almostDone);


    gulp.src('../../demo/**')
      .pipe(gulp.dest(DIR + '/gh-pages/demo'))
      .on('end', almostDone);
    gulp.src('../../dist/**')
      .pipe(gulp.dest(DIR + '/gh-pages/dist'))
      .on('end', almostDone);


    gulp.src('./branch/gh-pages/index.tmp.html')
      .pipe(cm.processTemplateFile())
      .pipe(rename({ext: '.html'}))
      .pipe(gulp.dest(DIR + '/gh-pages/'))
      .on('end', almostDone);

  }
};
