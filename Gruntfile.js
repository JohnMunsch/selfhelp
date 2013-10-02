module.exports = function(grunt) {
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    zip: {
      'newVersion.zip': [ 
        'app.js',
        'node_modules/nodemon/*',
        'package.json',
        'selfhelp.sh'
      ]
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-zip');

  // Default task(s).
  grunt.registerTask('default', ['zip']);
};