var pjson = require("./package.json");

var filename = pjson.name + '-' + pjson.version + '.zip';
var host = "http://localhost/";

module.exports = function(grunt) {  
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    zip: {
      'dist': {
        src: [
          'app.js',
          'node_modules/nodemon/*',
          'package.json',
          'selfhelp.sh'
        ],
        dest: 'dist/' + filename
      }
    },
    replace: {
      dist: {
        options: {
          patterns: [
            {
              match: 'version',
              replacement: pjson.version
            },
            {
              match: 'downloadURL',
              replacement: host + filename
            }
          ]
        },
        files: [
          {
            expand: true,
            flatten: true,
            src: [ 'versionInfo.json' ],
            dest: 'dist/'
          }
        ]
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-zip');
  grunt.loadNpmTasks('grunt-replace');

  // Default task(s).
  grunt.registerTask('default', [ 'zip', 'replace' ]);
};