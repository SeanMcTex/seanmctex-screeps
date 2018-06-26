var credentials = require('./credentials.js');

module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-screeps');

    grunt.initConfig({
        screeps: {
            options: credentials,
            dist: {
                src: ['dist/*.js']
            }
        }
    });
}