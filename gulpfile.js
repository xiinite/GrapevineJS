/**
 * Created by daeme_000 on 9/9/2015.
 */
var gulp       = require('gulp'),
    jshint     = require('gulp-jshint'),
    sourcemaps = require('gulp-sourcemaps'),
    concat     = require('gulp-concat'),
    uglify     = require('gulp-uglify'),
    minify     = require('gulp-minify-css'),
    htmlreplace = require('gulp-html-replace');

// define the default task and add the watch task to it
gulp.task('default', ['watch']);

// configure the jshint task
gulp.task('jshint', function() {
    return gulp.src('public/js/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'));
});

// configure which files to watch and what tasks to use on file changes
gulp.task('watch', function() {
    gulp.watch('public/js/**/*.js', ['jshint']);
});

gulp.task('build-js', function() {
    return gulp.src('public/js/**/*.js')
        .pipe(sourcemaps.init())
        .pipe(concat('bundle.js'))
        //only uglify if gulp is ran with '--type production'
        .pipe(uglify())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('dist/public/js/'));
});

gulp.task('build-css', function() {
    return gulp.src('public/css/**/*.css')
        .pipe(sourcemaps.init())
        .pipe(concat('styles.css'))
        //only uglify if gulp is ran with '--type production'
        .pipe(minify())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('dist/public/css/'));
});

gulp.task('build-html', function() {
    gulp.src('views/**/*.ejs')
        .pipe(htmlreplace({
            //'css': 'styles.min.css',
            'js': 'public/js/bundle.min.js'
        }))
        .pipe(gulp.dest('dist/views/'));
});