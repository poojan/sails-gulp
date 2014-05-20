var gulp = require('gulp');

var clean = require('gulp-clean');
var concat = require('gulp-concat');
var linker = require('gulp-linker');
var jst = require('gulp-jst');
var watch = require('gulp-watch');
var uglify = require('gulp-uglify');
var cssmin = require('gulp-cssmin');
var less = require('gulp-less');
var coffee = require('gulp-coffee');


/**
 * CSS files to inject in order
 * (uses Grunt-style wildcard/glob/splat expressions)
 *
 * By default, Sails also supports LESS in development and production.
 * To use SASS/SCSS, Stylus, etc., edit the `sails-linker:devStyles` task
 * below for more options.  For this to work, you may need to install new
 * dependencies, e.g. `npm install grunt-contrib-sass`
 */

var cssFilesToInject = [
  'linker/**/*.css'
];


/**
 * Javascript files to inject in order
 * (uses Grunt-style wildcard/glob/splat expressions)
 *
 * To use client-side CoffeeScript, TypeScript, etc., edit the
 * `sails-linker:devJs` task below for more options.
 */

var jsFilesToInject = [

  // Below, as a demonstration, you'll see the built-in dependencies
  // linked in the proper order order

  // Bring in the socket.io client
  'linker/js/socket.io.js',

  // then beef it up with some convenience logic for talking to Sails.js
  'linker/js/sails.io.js',

  // A simpler boilerplate library for getting you up and running w/ an
  // automatic listener for incoming messages from Socket.io.
  'linker/js/app.js',

  // *->    put other dependencies here   <-*

  // All of the rest of your app scripts imported here
  'linker/**/*.js'
];


/**
 * Client-side HTML templates are injected using the sources below
 * The ordering of these templates shouldn't matter.
 * (uses Grunt-style wildcard/glob/splat expressions)
 *
 * By default, Sails uses JST templates and precompiles them into
 * functions for you.  If you want to use jade, handlebars, dust, etc.,
 * edit the relevant sections below.
 */

var templateFilesToInject = [
  'linker/**/*.html'
];



/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////
//
// DANGER:
//
// With great power comes great responsibility.
//
/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////

// Modify css file injection paths to use
cssFilesToInject = cssFilesToInject.map(function (path) {
  return '.tmp/public/' + path;
});

// Modify js file injection paths to use
jsFilesToInject = jsFilesToInject.map(function (path) {
  return '.tmp/public/' + path;
});


templateFilesToInject = templateFilesToInject.map(function (path) {
  return 'assets/' + path;
});


gulp.task('copy:dev', function () {
  gulp.src('./assets/**/*.!(coffee)', { base: './assets' })
    .pipe(gulp.dest('.tmp/public'));
});

gulp.task('copy:build', function () {
  gulp.src('./.tmp/public/**/*', { base: './.tmp/public' })
    .pipe(gulp.dest('www'));
});

gulp.task('copy', ['copy:dev', 'copy:build']);


gulp.task('clean:dev', function () {
  gulp.src('.tmp/public/**')
    .pipe(clean());
});

gulp.task('clean:build', function () {
  gulp.src('www')
    .pipe(clean());
});

gulp.task('clean', ['clean:dev', 'clean:build']);


gulp.task('jst:dev', function () {
  gulp.src(templateFilesToInject)
    .pipe(jst())
    .pipe(gulp.dest('.tmp/public/jst.js'));
});

gulp.task('jst', ['jst:dev']);


gulp.task('less:dev', function () {
  gulp.src('assets/styles/*.less', { base: 'assets/styles/' })
    .pipe(less())
    .pipe(gulp.dest('.tmp/public/styles/'));

  gulp.src('assets/linker/styles/*.less', { base: 'assets/linker/styles/' })
    .pipe(less())
    .pipe(gulp.dest('.tmp/public/linker/styles/'));
});

gulp.task('less', ['less:dev']);


gulp.task('coffee:dev', function () {
  gulp.src('assets/js/**/*.coffee', { base: 'assets/js/' })
    .pipe(coffee({ bare: true }))
    .pipe(gulp.dest('.tmp/public/js/'));

  gulp.src('assets/linker/js/**/*.coffee', { base: 'assets/linker/js/' })
    .pipe(coffee({ bare: true }))
    .pipe(gulp.dest('.tmp/public/linker/js/'));
});

gulp.task('coffee', ['coffee:dev']);


gulp.task('concat:js', function () {
  gulp.src(jsFilesToInject)
    .pipe(concat())
    .pipe(gulp.dest('.tmp/public/concat/production.js'));
});

gulp.task('concat:css', function () {
  gulp.src(cssFilesToInject)
    .pipe(concat())
    .pipe(gulp.dest('.tmp/public/concat/production.css'));
});

gulp.task('concat', ['concat:js', 'concat:css']);


gulp.task('uglify:dist', function () {
  gulp.src('.tmp/public/concat/production.js')
    .pipe(uglify())
    .pipe(gulp.dest('.tmp/public/min/production.js'));
});

gulp.task('uglify', ['uglify:dist']);


gulp.task('cssmin:dist', function () {
  gulp.src('.tmp/public/concat/production.css')
    .pipe(cssmin())
    .pipe(gulp.dest('.tmp/public/min/production.css'));
});

gulp.task('cssmin', ['cssmin:dist']);


gulp.task('sails-linker:devJs', function () {
  gulp.src([
    '.tmp/public/**/*.html',
    'views/**/*.html',
    'views/**/*.ejs'
  ]).pipe(linker({
    scripts: jsFilesToInject,
    startTag: '<!--SCRIPTS-->',
    endTag: '<!--SCRIPTS END-->',
    fileTmpl: '<script src="%s"></script>',
    appRoot: '.tmp/public'
  }));
});

gulp.task('sails-linker:prodJs', function () {
  gulp.src([
    '.tmp/public/**/*.html',
    'views/**/*.html',
    'views/**/*.ejs'
  ]).pipe(linker({
    scripts: ['.tmp/public/min/production.js'],
    startTag: '<!--SCRIPTS-->',
    endTag: '<!--SCRIPTS END-->',
    fileTmpl: '<script src="%s"></script>',
    appRoot: '.tmp/public'
  }));
});

gulp.task('sails-linker:devStyles', function () {
  gulp.src([
    '.tmp/public/**/*.html',
    'views/**/*.html',
    'views/**/*.ejs'
  ]).pipe(linker({
    scripts: cssFilesToInject,
    startTag: '<!--STYLES-->',
    endTag: '<!--STYLES END-->',
    fileTmpl: '<link rel="stylesheet" href="%s">',
    appRoot: '.tmp/public'
  }));
});

gulp.task('sails-linker:prodStyles', function () {
  gulp.src([
    '.tmp/public/**/*.html',
    'views/**/*.html',
    'views/**/*.ejs'
  ]).pipe(linker({
    scripts: ['.tmp/public/min/production.css'],
    startTag: '<!--STYLES-->',
    endTag: '<!--STYLES END-->',
    fileTmpl: '<link rel="stylesheet" href="%s">',
    appRoot: '.tmp/public'
  }));
});

gulp.task('sails-linker:devTpl', function () {
  gulp.src([
    '.tmp/public/**/*.html',
    'views/**/*.html',
    'views/**/*.ejs'
  ]).pipe(linker({
    scripts: ['.tmp/public/jst.js'],
    startTag: '<!--TEMPLATES-->',
    endTag: '<!--TEMPLATES END-->',
    fileTmpl: '<script type="text/javascript" src="%s"></script>',
    appRoot: '.tmp/public'
  }));
});


// Jade
gulp.task('sails-linker:devJsJADE', function () {
  gulp.src([
    'views/**/*.jade'
  ]).pipe(linker({
    scripts: jsFilesToInject,
    startTag: '// SCRIPTS',
    endTag: '// SCRIPTS END',
    fileTmpl: 'script(type="text/javascript", src="%s")',
    appRoot: '.tmp/public'
  }));
});

gulp.task('sails-linker:prodJsJADE', function () {
  gulp.src([
    'views/**/*.jade'
  ]).pipe(linker({
    scripts: ['.tmp/public/min/production.js'],
    startTag: '// SCRIPTS',
    endTag: '// SCRIPTS END',
    fileTmpl: 'script(type="text/javascript", src="%s")',
    appRoot: '.tmp/public'
  }));
});

gulp.task('sails-linker:devStylesJADE', function () {
  gulp.src([
    'views/**/*.jade'
  ]).pipe(linker({
    scripts: cssFilesToInject,
    startTag: '// STYLES',
    endTag: '// STYLES END',
    fileTmpl: 'link(rel="stylesheet", href="%s")',
    appRoot: '.tmp/public'
  }));
});

gulp.task('sails-linker:prodStylesJADE', function () {
  gulp.src([
    'views/**/*.jade'
  ]).pipe(linker({
    scripts: ['.tmp/public/min/production.css'],
    startTag: '// STYLES',
    endTag: '// STYLES END',
    fileTmpl: 'link(rel="stylesheet", href="%s")',
    appRoot: '.tmp/public'
  }));
});

gulp.task('sails-linker:devTplJADE', function () {
  gulp.src([
    'views/**/*.jade'
  ]).pipe(linker({
    scripts: ['.tmp/public/jst.js'],
    startTag: '// TEMPLATES',
    endTag: '// TEMPLATES END',
    fileTmpl: 'script(type="text/javascript", src="%s")',
    appRoot: '.tmp/public'
  }));
});


gulp.task('sails-linker', [
  'sails-linker:devJs',
  'sails-linker:prodJs',
  'sails-linker:devStyles',
  'sails-linker:prodStyles',
  'sails-linker:devTpl',

  'sails-linker:devJsJADE',
  'sails-linker:prodJsJADE',
  'sails-linker:devStylesJADE',
  'sails-linker:prodStylesJADE',
  'sails-linker:devTplJADE'
]);



gulp.task('watch:api', function () {
  gulp.watch('api/**/*', []);
});

gulp.task('watch:assets', function () {
  gulp.watch('assets/**/*', ['compileAssets', 'linkAssets']);
});

gulp.task('watch', ['watch:api', 'watch:assets']);


gulp.task('default', [
  'compileAssets',
  'linkAssets',
  'watch'
]);

gulp.task('compileAssets', [
  'clean:dev',
  'jst:dev',
  'less:dev',
  'copy:dev',
  'coffee:dev'
]);

gulp.task('linkAssets', [
  'sails-linker:devJs',
  'sails-linker:devStyles',
  'sails-linker:devTpl',
  'sails-linker:devJsJADE',
  'sails-linker:devStylesJADE',
  'sails-linker:devTplJADE'
]);

gulp.task('build', [
  'compileAssets',
  'linkAssets',
  'clean:build',
  'copy:build'
]);

gulp.task('prod', [
  'clean:dev',
  'jst:dev',
  'less:dev',
  'copy:dev',
  'coffee:dev',
  'concat',
  'uglify',
  'cssmin',
  'sails-linker:prodJs',
  'sails-linker:prodStyles',
  'sails-linker:devTpl',
  'sails-linker:prodJsJADE',
  'sails-linker:prodStylesJADE',
  'sails-linker:devTplJADE'
]);
