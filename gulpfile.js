var date = require('moment'),
    del = require('del'),
    runSequence = require('run-sequence');
    karma = require('karma').server,

    gulp = require('gulp'),
    $ = require('gulp-load-plugins')();

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
    del([paths.distDir, paths.tempDir], cb);
});

gulp.task('concat', function () {
    return gulp.src([
        'build/module.prefix',                    
        paths.baseDir + '/localization*.js',
        'build/module.suffix'
    ])
    .pipe($.concat('angular-localization.js'))
    .pipe($.header(banner, { pkg : pkg } ))
    .pipe(gulp.dest(paths.distDir))
});

gulp.task('uglify', function () {
    return gulp.src(paths.distDir + '/angular-localization.js')
        .pipe($.uglifyjs('angular-localization.min.js', {
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
        .pipe($.gzip())
        .pipe(gulp.dest(paths.distDir))
});

gulp.task('karma', function (cb) {
    karma.start({
        configFile: __dirname + '/build/karma.conf.js'
    }, cb);
});

gulp.task('preprocess', function () {
    return gulp.src(paths.distDir + '/angular-localization.js')
        .pipe($.preprocess({
            context: { VERSION: pkg.version }
        }))
        .pipe(gulp.dest(paths.distDir));
});

gulp.task('build', function () {
    runSequence('clean', 'concat', 'preprocess', 'uglify', 'compress');
});

gulp.task('test', ['karma']);
