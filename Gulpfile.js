'use strict';

var gulp = require('gulp');
var cm = require('./lib/common');
cm.public = require('../../publish.js')();

// More libs !
var changelogWrapper = require('conventional-changelog-wrapper');
var _public = '../../component-publisher';


//////////////////////////////////////////////////////////////////////////////
// CLEAN
//////////////////////////////////////////////////////////////////////////////

gulp.task('clean', function(done) {
  gulp.src(_public + '/**').pipe(cm.rimraf())
    .on('end', done);
});




//////////////////////////////////////////////////////////////////////////////
// BUILD GH-PAGE
//////////////////////////////////////////////////////////////////////////////

gulp.task('build_ghpage', function(done){

  if (!cm.public.tocopy)  cm.public.tocopy = [];
  var almostDone = cm._.after( 5 + cm.public.tocopy.length, done);

  cm.public.tocopy
    .map(function(file) {
      gulp.src('../../' + file)
        .pipe(gulp.dest(_public + '/gh-pages/vendor'))
        .on('end', almostDone);
     });

  gulp.src('./branch/gh-pages/core/**')
    .pipe(gulp.dest(_public + '/gh-pages/core'))
    .on('end', almostDone);
  gulp.src('./branch/gh-pages/assets/**')
    .pipe(gulp.dest(_public + '/gh-pages/assets'))
    .on('end', almostDone);


  gulp.src('../../demo/**')
    .pipe(gulp.dest(_public + '/gh-pages/demo'))
    .on('end', almostDone);
  gulp.src('../../dist/**')
    .pipe(gulp.dest(_public + '/gh-pages/dist'))
    .on('end', almostDone);


  gulp.src('./branch/gh-pages/index.tmp.html')
    .pipe(cm.processTemplateFile())
    .pipe(cm.rename({ext : '.html'}))
    .pipe(gulp.dest(_public + '/gh-pages/'))
    .on('end', almostDone);

});


//////////////////////////////////////////////////////////////////////////////
// BUILD MISC
//////////////////////////////////////////////////////////////////////////////

gulp.task('changelog', function(){
  changelogWrapper.generate()
    .pipe(
      cm.es.map(function fakeFile(content, cb){
        return cb(null, new cm.gutil.File({
          path: './CHANGELOG.md', cwd: './', base: './',
          contents: new Buffer(content)
        }));
      })
    )
    .pipe(cm.header('# <%= public.humaName %> - CHANGELOG', cm))
    .pipe(gulp.dest(_public + '/'));
});


//////////////////////////////////////////////////////////////////////////////
// TASKS
//////////////////////////////////////////////////////////////////////////////

gulp.task('ghpages', ['clean'], function(cb){
  gulp.run('changelog', 'build_ghpage', cb);
});



