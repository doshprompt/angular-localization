module.exports = function (grunt) {
    'use strict';

    var paths = {
            baseDir: 'src',
            distDir: 'dist',
            tempDir: 'tmp'
        };

    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    grunt.initConfig({
        pkg: grunt.file.readJSON('bower.json'),

        banner:
            '/**\n' +
            ' * <%= pkg.title || pkg.name %> :: v<%= pkg.version %> :: <%= grunt.template.today("yyyy-mm-dd") %>\n' +
            ' * web: <%= pkg.homepage %>\n' +
            ' *\n' +
            ' * Copyright (c) <%= grunt.template.today("yyyy") %> | <%= pkg.authors %>\n' +
            ' * License: <%= pkg.license %>\n' +
            ' */\n',

        clean: {
            src: [
                paths.distDir,
                paths.tempDir
            ]
        },

        copy: {
            readme: {
                src: 'README.md',
                dest: paths.distDir  + '/'
            },
            license: {
                src: 'LICENSE',
                dest: paths.distDir + '/'
            },
            bower: {
                src: 'bower.json',
                dest: paths.distDir + '/'
            }
        },

        concat: {
            all: {
                options: {
                    banner: '<%= banner %>'
                },
                src: [paths.baseDir + '/localization*.js'],
                dest: paths.distDir + '/angular-localization.js'
            }
        },

        uglify: {
            all: {
                options: {
                    banner: '<%= banner %>',
                    sourceMap: true,
                    report: 'gzip'
                },
                files: {
                    'dist/angular-localization.min.js': [paths.distDir + '/angular-localization.js']
                }
            }
        },

        compress: {
            dist: {
                options: {
                    mode: 'gzip'
                },
                expand: true,
                src: ['dist/*.min.js'],
                ext: '.min.js.gzip'
            }
        },

        'json-replace': {
            options: {
                replace: {
                    description: 'angularjs localization, the good parts.'
                },
                space: '  '
            },
            bwr: {
                files: [{
                    src: paths.distDir + '/bower.json',
                    dest: paths.distDir + '/bower.json'
                }]
            }
        },

        karma: {
            unit: {
                options: {
                    configFile: 'tests/karma.conf.js',
                }
            }
        }
    });

    grunt.registerTask('build', ['clean', 'concat', 'uglify', 'compress', 'copy', 'json-replace']);

    grunt.registerTask('test', ['karma:unit']);
}