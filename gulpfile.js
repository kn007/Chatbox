var gulp = require('gulp'); 

// include plug-ins
var concat = require('gulp-concat');
var stripDebug = require('gulp-strip-debug');
var uglify = require('gulp-uglify');

// JS concat, strip debugging and minify
gulp.task('default', function() {

  // bundle for chatbox.js 
  gulp.src([
    './dev/server/config.js',
  	'./dev/client/chatbox/init.js',
  	'./dev/client/chatbox/utils/*.js', 
  	'./dev/client/chatbox/controllers/*.js', 
  	'./dev/client/chatbox/handlers/*.js',
  	'./dev/client/chatbox/main.js'
  	])
    .pipe(concat('chatbox.js'))
    .pipe(stripDebug())
    .pipe(uglify())
    .pipe(gulp.dest('./build/'));

  // bundle for admin.js
  gulp.src([
  	'./dev/client/controlpanel/init.js',
  	'./dev/client/controlpanel/utils/*.js', 
  	'./dev/client/controlpanel/controllers/*.js', 
  	'./dev/client/controlpanel/handlers/*.js',
  	'./dev/client/controlpanel/main.js'
  	])
    .pipe(concat('admin.js'))
    .pipe(stripDebug())
    .pipe(uglify())
    .pipe(gulp.dest('./build/'));


});