module.exports = function (grunt) {
    'use strict';

    var paths = {
            baseDir: 'src',
            distDir: 'dist',
            tempDir: 'tmp'
        };

    require('load-grunt-tasks')(grunt);

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

        concat: {
            all: {
                options: {
                    banner: '<%= banner %>'
                },
                src: [
                    'build/module.prefix',
                    paths.baseDir + '/localization*.js',
                    'build/module.suffix',
                ],
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

        connect: {
            options: {
                port: 9001,
                base: '.'
            },
            ngTest: {
                // uses_defaults
            },
            server: {
                options: {
                    keepalive: true
                }
            }
        },

        karma: {
            unit: {
                options: {
                    configFile: 'build/karma.conf.js',
                }
            }
        },

        protractor: {
            e2e: {
                options: {
                    configFile: "build/protractor.conf.js"
                }
            }
        },

        preprocess: {
            options: {
                inline: true,
                context: {
                    VERSION: 'v<%= pkg.version %>'
                }
            },
            bump: {
                src: [ paths.distDir + '/angular-localization.js']
            }
        }
    });

    grunt.registerTask('build', ['clean', 'concat', 'preprocess', 'uglify', 'compress']);

    grunt.registerTask('test', ['karma', 'connect:ngTest', 'protractor']);
};