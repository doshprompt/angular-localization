var DIST_DIR = 'dist',
    SRC_FILES = 'src/**/*.js',

    path = require('path'),

    date = require('moment'),
    del = require('del'),
    karma = require('karma').server,

    runSequence = require('run-sequence'),

    gulp = require('gulp'),
    $ = require('gulp-load-plugins')(),
    
    banner = [
        '/*!',
        ' * <%= package.title || package.name %> :: v<%= package.version %> :: <%= package.todayDate  %>',
        ' * web: <%= package.homepage %>',
        ' *',
        ' * Copyright (c) <%= package.todayYear %> | <%= package.author %>',
        ' * License: <%= package.license %>',
        ' */',
        ''
        ].join('\n'),

    pkg = require('./package.json');

pkg.todayDate = date().format('YYYY-MM-DD');
pkg.todayYear = date().format('YYYY');

gulp.task('clean', function(done) {
    del(DIST_DIR, done);
});

gulp.task('scripts', function() {
    var filename = pkg.name + '.js';

    return gulp.src(SRC_FILES)
        .pipe($.angularFilesort())
        .pipe($.addSrc.prepend('module.prefix'))
        .pipe($.addSrc.append('module.suffix'))
        .pipe($.concat(filename))
        .pipe($.preprocess({
            context: {
                VERSION: pkg.version
            }
        }))
        .pipe($.header(banner, {
            package: pkg
        }))
        .pipe($.ngAnnotate({
            add: true,
            remove: true,
            single_quotes: true
        }))
        .pipe(gulp.dest(DIST_DIR))
        .pipe($.sourcemaps.init())
        .pipe($.uglify({
            preserveComments: 'some'
        }))
        .pipe($.rename({
            suffix: '.min'
        }))
        .pipe($.sourcemaps.write('.'))
        .pipe(gulp.dest(DIST_DIR));
});

gulp.task('styles', function() {
    var filename = pkg.name + '.css';

    return gulp.src('src/**/*.less')
        .pipe($.sourcemaps.init())
        .pipe($.less())
        .pipe($.concat(filename))
        .pipe($.header(banner, {
            package: pkg
        }))
        .pipe(gulp.dest(DIST_DIR))
        .pipe($.rename({
            suffix: '.min'
        }))
        .pipe($.sourcemaps.write('.'))
        .pipe(gulp.dest(DIST_DIR));
});

gulp.task('default', function(done) {
    runSequence(['scripts', 'styles'], done)
});

gulp.task('test', ['lint'], function(done) {
    karma.start({
        configFile: path.join(__dirname, 'karma.conf.js')
    }, function() {
        done();
    });
});

gulp.task('lint', function() {
    return gulp.src(SRC_FILES)
        .pipe($.jshint())
        .pipe($.jshint.reporter('jshint-stylish'))
        .pipe($.jshint.reporter('fail'));
});

gulp.task('serve', ['clean', 'default'], function() {
  return gulp.src('.')
    .pipe($.webserver({
        directoryListing: {
            enable:true,
            path: '.'
        },
        open: 'app/index.html'
    }));
});
