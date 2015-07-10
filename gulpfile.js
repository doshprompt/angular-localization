var PRESERVE_COMMENT_BLOCK = new RegExp('Copyright'),

    DIST_DIR = 'dist',
    SRC_FILES = 'src/**/*.js',

    path = require('path'),

    date = require('moment'),
    del = require('del'),
    karma = require('karma').server,

    gulp = require('gulp'),
    $ = require('gulp-load-plugins')(),
    
    banner = [
        '/**',
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

gulp.task('default', function() {
    var filename = pkg.name + '.js';

    return gulp.src(SRC_FILES)
        .pipe($.newer(path.join(DIST_DIR, filename)))
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
        .pipe(gulp.dest(DIST_DIR))
        .pipe($.ngAnnotate({
            add: true,
            remove: true,
            single_quotes: true
        }))
        .pipe($.sourcemaps.init())
        .pipe($.uglify({
            preserveComments: function(node, comment) {
                return PRESERVE_COMMENT_BLOCK.test(comment.value);
            }
        }))
        .pipe($.rename({
            suffix: '.min'
        }))
        .pipe($.sourcemaps.write('.'))
        .pipe(gulp.dest(DIST_DIR));
});

gulp.task('test', ['lint'], function(done) {
    karma.start({
        configFile: path.join(__dirname, 'karma.conf.js')
    }, done);
});

gulp.task('lint', function() {
    return gulp.src(SRC_FILES)
        .pipe($.jshint())
        .pipe($.jshint.reporter('jshint-stylish'))
        .pipe($.jshint.reporter('fail'));
});
