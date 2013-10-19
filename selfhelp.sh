# Remove the watched file. nodemon seems to trigger incorrectly if it's already there.
rm status.js

node node_modules/nodemon/nodemon.js --delay 3 --watch status.js