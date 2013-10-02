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
var autoInstall = false;

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
      checkDownloadValidateAndInstall(JSON.parse(versionInfo));
    });
  }).on('error', function(e) {
    console.log("Got error: " + e.message);
  });
}

function checkDownloadValidateAndInstall(versionInfo) {
  lastPollingResults = versionInfo;
  lastPollingResults.newVersionAvailable = false;

  // Is a new version available?
  if (newVersion(pjson.version, versionInfo)) {
    // Update the polling results to indicate that there's a newer version than the installed one available.
    lastPollingResults.newVersionAvailable = true;

    // There's a new version, do we automatically run the installation sequence now?
    if (autoInstall) {
      downloadValidateAndInstall(versionInfo.downloadURL);
    }
  }
}

function downloadValidateAndInstall(downloadURL) {
  // Execute the complete sequence of operations.
  var file = fs.createWriteStream(downloadDestination);

  var request = http.get(downloadURL, function (response) {
    response.pipe(file);

    file.on("finish", function() {
      file.close();

      function validate() {
        // Validate that what we downloaded is good.
        function install() {
          // Install the software.
          function cleanUp() {
            // Clean up the downloaded file.
            lastPollingResults.newVersionAvailable = false;
          }
        }
      }
    });
  });
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