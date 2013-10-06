var http = require("http");
var fs = require("fs");
var pjson = require("./package.json");

// The official location which should be polled to check for new version info. The format of the data expected at that
// URL is discussed below in the poll() function.
var pollingURL = "http://localhost/versionInfo.json";
var pollingInterval = 1000;
var lastPollingResults = { };
var downloadDestination = "newVersion.zip";

// You might make this an option available to your users or you could just decide how you want it to be, set it, and
// forget it.
var autoInstall = true;

function startPolling() {
  // Check for a new version.
  setInterval(poll, pollingInterval);
}

function poll(url) {
  // Hit the polling location to get a JSON value which should contain both a version and a download URL:
  // { "version" : "0.0.4", "downloadURL" : "http://www.sample.com/software.0.0.4.zip" }
  //
  // It may optionally include an information URL or anything else you'd like to expose to the rest of the software,
  // the latest version of the downloaded information will be visible to the rest of the application.
  http.get("http://localhost/versionInfo.json", function(res) {
    res.on('data', function (versionInfo) {
      // The default response to a new version is to do absolutely nothing.
      var handleNewVersion = function () { };

      // But if the user has indicated he/she wants to automatically download, verify, install, etc. then we can
      // build up that sequence here.
      if (autoInstall) {

      }
      checkAndInstall(JSON.parse(versionInfo));
    });
  }).on('error', function(e) {
    console.log("Got error: " + e.message);
  });
}

function checkAndInstall(versionInfo, callback) {
  lastPollingResults = versionInfo;
  lastPollingResults.newVersionAvailable = false;

  // Is a new version available?
  if (newVersion(pjson.version, versionInfo)) {
    // Update the polling results to indicate that there's a newer version than the installed one available.
    lastPollingResults.newVersionAvailable = true;

    callback(versionInfo.downloadURL);
  }
}

/**
 * Compare the current version of the app against whatever we retrieved from the remote URL.
 *
 * @param pjson
 * @return true if the polling result indicates a newer version is available and false otherwise.
 */
function newVersion(localVersion, pollingResult) {
  // If we go for the default versioning system which npm seems happiest the versions will be major.minor.build.

  // We first need to break up both the local version number and the pollingResult version number into their constituent
  // parts.
  var localVersionParts = localVersion.split(".");
  var localMajor = parseInt(localVersionParts[0]);
  var localMinor = parseInt(localVersionParts[1]);
  var localBuild = parseInt(localVersionParts[2]);

  var remoteVersionParts = pollingResult.version.split(".");
  var remoteMajor = parseInt(remoteVersionParts[0]);
  var remoteMinor = parseInt(remoteVersionParts[1]);
  var remoteBuild = parseInt(remoteVersionParts[2]);

  if (remoteMajor > localMajor) {
    return true;
  } else if (remoteMajor == localMajor) {
    if (remoteMinor > localMinor) {
      return true;
    } else if (remoteMinor == localMinor) {
      if (remoteBuild > localBuild) {
        return true;
      }
    }
  }

  return false;
}

function download(downloadURL, callback) {
  // Execute the complete sequence of operations.
  var file = fs.createWriteStream(downloadDestination);

  var request = http.get(downloadURL, function (response) {
    response.pipe(file);

    file.on("finish", function() {
      console.log("New version downloaded.");

      file.close(function () {
        callback();
      });
    });
  });
}

function validate(callback) {
  // Validate is a no-op at the moment. None of the JavaScript ZIP implementations I've looked at so far has had the
  // ability to test a ZIP file to make sure it downloaded without errors. A good substitute would be to calculate a
  // hash value for the original ZIP file when it was created and then put that same hash into the versionInfo.json
  // file. That hash could be checked once the file has been downloaded.

  callback();
}

function install(callback) {
  // Unzip the downloaded file here, replacing all of the files which make up the application. A more sophisticated
  // install might allow for deleting old orphaned files which were once used but no longer are.

  callback();
}

function cleanUpAndTriggerRestart() {
  // Clean up the downloaded file.
  fs.unlink(downloadDestination, function () {
    // Now touch the semaphore file that signals we need to restart the server.
    fs.open("status.js", "w+", function (err, fd) {
      var newTime = new Date().getTime();

      fs.futimes(fd, newTime, newTime, function (err) {
        fs.closeSync(fd);
      });
    });
  });
}

function gracefulShutdown(postShutdown) {
  console.log("Shutting down...");
  // TODO: Put your shutdown code in here.

  postShutdown();
}

// Setup a process which will watch for a signal from nodemon that it's time to restart.
process.once("SIGUSR2", function () {
  gracefulShutdown(function () {
    // Graceful shutdown is complete. Kill this server.
    process.kill(process.pid, "SIGUSR2");
  })
});

console.log("Starting up version " + pjson.version + "...");
// This code is ripped straight from the Node.js home page. It's the example of the most minimal Node.js HTTP server.
// TODO: Replace this with your own Node.js server.
http.createServer(function (req, res) {
  res.writeHead(200, {"Content-Type": "text/html"});

  res.write("<p><em>selfhelp</em> - Self updating Node.js example<br>Version " + pjson.version + "</p>");
  if (lastPollingResults.newVersionAvailable) {
    res.end("<p>New Version Available</p>");
  } else {
    res.end("");
  }
}).listen(1337, "127.0.0.1");

startPolling(pollingURL);
console.log("Server running at http://127.0.0.1:1337/");