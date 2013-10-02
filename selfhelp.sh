# The --delay 5 delays the nodemon restart for five seconds after it notices a file has changed. That way it doesn't
# restart multiple times when a bunch of files are going to change. This number can easily be bumped up to a higher
# value if you have a large application (which may take a while to unzip).
node node_modules/nodemon/nodemon.js --delay 5