'use strict';

var gulp = require('gulp');
var cm = require('./lib/common');
cm.public = require('../../publish.js')();
cm.bwr = require('../../bower.json');

// More libs !
var changelogWrapper = require('conventional-changelog-wrapper');
var _public = '../../component-publisher';


//////////////////////////////////////////////////////////////////////////////
// CLEAN
//////////////////////////////////////////////////////////////////////////////

gulp.task('clean', function (done) {
  gulp.src(_public + '/**').pipe(cm.rimraf())
    .on('end', done);
});





//////////////////////////////////////////////////////////////////////////////
// BUILD STUFF
//////////////////////////////////////////////////////////////////////////////


//////////////////////////////////////////////////////////////////////////////
// BUILD GH-PAGE
//////////////////////////////////////////////////////////////////////////////

gulp.task('build_gh-pages', function (done) {

  if (!cm.public.tocopy)  cm.public.tocopy = [];
  var almostDone = cm._.after(5 + cm.public.tocopy.length, done);

  cm.public.tocopy
    .map(function (file) {
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
    .pipe(cm.rename({ext: '.html'}))
    .pipe(gulp.dest(_public + '/gh-pages/'))
    .on('end', almostDone);

});


//////////////////////////////////////////////////////////////////////////////
// BUILD BOWER
//////////////////////////////////////////////////////////////////////////////

gulp.task('build_bower', function (done) {

  var almostDone = cm._.after(3, done);

  gulp.src('./branch/bower/.travis.yml')
    .pipe(gulp.dest(_public + '/bower/'))
    .on('end', almostDone);

  gulp.src('./branch/bower/bower.tmpl.json')
    .pipe(cm.processTemplateFile())
    .pipe(cm.rename({ext: '.json'}))
    .pipe(gulp.dest(_public + '/bower/'))
    .on('end', almostDone);

  gulp.src('../../dist/**')
    .pipe(gulp.dest(_public + '/bower/'))
    .on('end', almostDone);
});

//////////////////////////////////////////////////////////////////////////////
// BUILD MISC
//////////////////////////////////////////////////////////////////////////////

gulp.task('changelog', function (done) {
  changelogWrapper.generate()
    .pipe(
      cm.es.map(function fakeFile(content, cb) {
        return cb(null, new cm.gutil.File({
          path: './CHANGELOG.md', cwd: './', base: './',
          contents: new Buffer(content)
        }));
      })
    )
    .pipe(cm.header('# <%= public.humaName %> - CHANGELOG', cm))
    .pipe(gulp.dest(_public + '/'))
    .on('end', done);
});





//////////////////////////////////////////////////////////////////////////////
// PUBLISH STUFF
//////////////////////////////////////////////////////////////////////////////

gulp.task('publish_gh-pages', function (done) {

  var env = this.env;
  var fs = require('fs');
  var sh = require('shelljs');


  var options = {
    cloneLocation: cm.path.resolve(cm.path.join('.tmp', 'publish', this.env.branch)),
    dirSrc: cm.path.resolve(cm.path.join(_public, this.env.branch)),
    branch: this.env.branch,
    remote: 'origin',
    message: 'Updates'
    //cloneLocation : path.join(process.env.HOME, 'tmp', this.name, this.target)
  };

  function e(cmd_tmpl, data) {
    var cmd = cm._.template(cmd_tmpl, cm._.extend(data || {}, options));
    if (env.verbose) cm.gutil.log('$', cm.gutil.colors.cyan(cmd));
    return sh.exec(cmd, { cwd: '123'});
  }

  var origin_cwd = process.cwd();
  sh.cd('../..');

  var res;

  // Get the remote.origin.url
  res = e('git config --get remote.origin.url 2>&1 >/dev/null');
  if (res.code > 0) throw new Error('Can\'t get no remote.origin.url !');

  options.repoUrl = process.env.REPO || String(res.output).split(/[\n\r]/).shift();
  if (!options.repoUrl) throw new Error('No repo link !');

  // Remove tmp file

  if (fs.existsSync(options.cloneLocation)) {
    e('rm -rf <%= cloneLocation %>');
  }

  // Clone the repo branch to a special location (clonedRepoLocation)
  res = e('git clone --branch=<%= branch %> --single-branch <%= repoUrl %> <%= cloneLocation %>');
  if (res.code > 0) {
    // try again without banch options
    res = e('git clone <%= repoUrl %> <%= cloneLocation %>');
    if (res.code > 0) throw new Error('Can\'t clone !');
  }


  // Go to the cloneLocation
  sh.cd(options.cloneLocation);

  if (sh.pwd() !== options.cloneLocation) {
    throw new Error('Can\'t access to the clone location : ' + options.cloneLocation + ' from ' + sh.pwd());
  }

  e('git clean -f -d');
  e('git fetch <%= remote %>');

  // Checkout a branch (create an orphan if it doesn't exist on the remote).
  res = e('git ls-remote --exit-code . <%= remote %>/<%= branch %>');
  if (res.code > 0) {
    // branch doesn't exist, create an orphan
    res = e('git checkout --orphan <%= branch %>');
    if (res.code > 0) throw new Error('Can\'t clone !');
  } else {
    // branch exists on remote, hard reset
    e('git checkout <%= branch %>');
  }


  if (!options.add) {
    // Empty the clone
    e('git rm --ignore-unmatch -rfq \'\\.[^\\.]*\' *');
  }


  // Copie the targeted files
  res = sh.cp('-rf', options.dirSrc, options.cloneLocation);
  if (res && res.code > 0) throw new Error(res.output);

  // Add and commit all the files

  e('git add .');
  res = e('git commit -m \'<%= message%>\'');


  if (options.tag) {
    res = e('<%= git %> tag <%= tag %>');
    if (res.code > 0) throw new Error('Can\'t tag failed, continuing !');
  }

  // Push :)
  if (options.push) {
    e('<%= git %> push --tags <%= remote %> <%= branch %>');
  }

  // Restor path...
  sh.cd(origin_cwd);
  done();
});





//////////////////////////////////////////////////////////////////////////////
// TASKS
//////////////////////////////////////////////////////////////////////////////

function prefixedBranchedTasks(prefix) {

  gulp.task(prefix, function (cb) {
    if (!this.env.branch)
      throw new Error('\nJust say want you want to ' + prefix + ' like\n' + prefix + ' --branch=bower');

    // TODO test if exist ?
    gulp.run(prefix + '_' + this.env.branch, cb);
  });

}
prefixedBranchedTasks('build');
prefixedBranchedTasks('publish');


