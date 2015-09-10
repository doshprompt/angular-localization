var gulp = require('gulp'),
    del = require('del'),
    header = require('gulp-header'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglifyjs'),
    using = require('gulp-using')
    date = require('moment'),
    gzip = require('gulp-gzip'),
    karma = require('karma').server,
    webserver = require('gulp-webserver'),
    protractor = require('gulp-protractor').protractor,
    webdriver_update = require('gulp-protractor').webdriver_update,
    exit = require('gulp-exit'),
    preprocess = require('gulp-preprocess'),
    runSequence = require('run-sequence');

var paths = {
    baseDir: 'src',
    distDir: 'dist',
    tempDir: 'tmp',
    e2e: 'tests/e2e/*.js'
};

var pkg = require('./package.json');
    pkg.todayDate = date().format('YYYY-MM-DD')
    pkg.todayYear = date().format('YYYY')

var banner = [
    '/**',
    ' * <%= pkg.title || pkg.name %> :: v<%= pkg.version %> :: <%= pkg.todayDate  %>',
    ' * web: <%= pkg.homepage %>',
    ' *',
    ' * Copyright (c) <%= pkg.todayYear %> | <%= pkg.author %>',
    ' * License: <%= pkg.license %>',
    ' */',
    ''
    ].join('\n');

gulp.task('clean', function (cb) {
    del([paths.distDir, paths.tempDir, './angular-localization*' ], cb);
});

gulp.task('concat', function () {
    return gulp.src([
        'build/module.prefix',                    
        paths.baseDir + '/localization*.js',
        'build/module.suffix'
    ])
        .pipe(concat('angular-localization.js'))
        .pipe(header(banner, { pkg : pkg } ))
        .pipe(gulp.dest(paths.distDir))
});

gulp.task('uglify', function () {
    return gulp.src(paths.distDir + '/angular-localization.js')
        .pipe(uglify('angular-localization.min.js', {
            outSourceMap: 'angular-localization.min.map',
            basePath: 'dist/',
            output: { 
                comments: /Copyright/
            }
        }))
        .pipe(gulp.dest(paths.distDir))
});

gulp.task('compress', function () {
    return gulp.src(paths.distDir + '/*.min.js')
        .pipe(gzip())
        .pipe(gulp.dest(paths.distDir))
});

gulp.task('karma', function (cb) {
    karma.start({
        configFile: __dirname + '/build/karma.conf.js'
    }, cb);
});

// use this helper task to update webdriver to the latest version
gulp.task('webdriver-update', webdriver_update);

gulp.task('connect', function () {
    gulp.src('.')
        .pipe(webserver({
            port: 9001
        }));
});

gulp.task('preprocess', function () {
    return gulp.src(paths.distDir + '/angular-localization.js')
        .pipe(preprocess({
            context: { VERSION: pkg.version }
        }))
        .pipe(gulp.dest(paths.distDir));
});

gulp.task('copy', function () {
    return gulp.src(paths.distDir + "/*")
      .pipe(gulp.dest('./'));
});

gulp.task('protractor', ['webdriver-update', 'connect'], function () {
    gulp.src(paths.e2e)
        .pipe((protractor({
            configFile: 'build/protractor.conf.js'
        })).on('error', function (e) {
            throw e;
        }))
        .pipe(exit());
});

gulp.task('build', function () {
    runSequence('clean', 'concat', 'preprocess', 'uglify', 'compress', 'copy');
});

gulp.task('test', ['karma']);
