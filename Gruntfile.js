var pjson = require("./package.json");

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
	    dest: pjson.name + '-' + pjson.version + '.zip'
	  }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-zip');

  // Default task(s).
  grunt.registerTask('default', [ 'zip' ]);
};