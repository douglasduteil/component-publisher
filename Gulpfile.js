'use strict';


//////////////////////////////////////////////////////////////////////////////
// REQUIRED
//////////////////////////////////////////////////////////////////////////////

var gulp = require('gulp');
var cm = require('./lib/common');


var publish = require('./lib/publish');
var build = require('./lib/build');



//////////////////////////////////////////////////////////////////////////////
// TASKS
//////////////////////////////////////////////////////////////////////////////

gulp.task('clean', function(done) {

  var rimraf = require('gulp-rimraf');
  var DIR = cm.component_publisher_dir;
  gulp.src(DIR + '/**').pipe(rimraf())
  .on('end', done);
});

gulp.task('build_gh-pages', build.ghpages);
gulp.task('build_bower', build.bower);


gulp.task('publish_gh-pages', publish);


function prefixedBranchedTasks(prefix){

  gulp.task(prefix, function(cb){
    if (!this.env.branch )
      throw new Error('\nJust say want you want to ' + prefix + ' like\n' + prefix + ' --branch=bower');

    // TODO test if exist ?
    gulp.run(prefix + '_' + this.env.branch, cb);
  });

}
prefixedBranchedTasks('build');
prefixedBranchedTasks('publish');


