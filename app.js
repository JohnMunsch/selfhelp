var http = require("http");
var fs = require("fs");
var AdmZip = require("adm-zip");
var pjson = require("./package.json");

// TODO: Update these settings for your particular program.
// The official location which should be polled to check for new version info. The format of the data expected at that
// URL is discussed below in the poll() function.
var pollingURL = "http://localhost/versionInfo.json";
var pollingInterval = 4000;

// You might make this an option available to your users or you could just decide how you want it to be, set it, and
// forget it. Note: If you turn off auto install, then you need to provide a button which invokes
// download(lastPollingResults.downloadURL) so the end user can manually kick off a software upgrade.
var autoInstall = false;

// I doubt you'll need to change either of these.
var downloadDestination = "newVersion.zip";
var deploymentDestination = ".";

// This exposes the results of the last polling. The main values you're likely to be interested in is
// lastPollingResults.newVersionAvailable or lastPollingResults.version. You can see both of those used below in the
// simple server to update the page at localhost:1337 with the knowledge that a new version is available and its
// version number.
var lastPollingResults = { };


var pollingIntervalID;

function startPolling() {
  // Check for a new version.
  pollingIntervalID = setInterval(poll, pollingInterval);
}

function stopPolling() {
  clearInterval(pollingIntervalID);
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
      var handleNewVersion = function () {
        console.log("New version available...");
      };

      // But if the user has indicated he/she wants to automatically download, verify, install, etc. then we can
      // set that up here.
      if (autoInstall) {
        // Pass in the first step of the multi-step sequence.
        handleNewVersion = download;
      }

      checkAndHandleNewVersion(JSON.parse(versionInfo), handleNewVersion);
    });
  }).on('error', function(e) {
    console.log("Got error: " + e.message);
  });
}

function checkAndHandleNewVersion(versionInfo, callback) {
  lastPollingResults = versionInfo;
  lastPollingResults.newVersionAvailable = false;

  // Is a new version available?
  if (newVersion(pjson.version, lastPollingResults)) {
    // Update the polling results to indicate that there's a newer version than the installed one available.
    lastPollingResults.newVersionAvailable = true;

    callback(lastPollingResults.downloadURL);
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

function download(downloadURL) {
  stopPolling();
  console.log("Downloading New Version...");

  // Execute the complete sequence of operations.
  var file = fs.createWriteStream(downloadDestination);

  var request = http.get(downloadURL, function (response) {
    response.pipe(file);

    file.on("finish", function() {
      file.close(function () {
        validate();
      });
    });
  });
}

function validate() {
  // Validate is a no-op at the moment. None of the JavaScript ZIP implementations I've looked at so far has had the
  // ability to test a ZIP file to make sure it downloaded without errors. A good substitute would be to calculate a
  // hash value for the original ZIP file when it was created and then put that same hash into the versionInfo.json
  // file. That hash could be checked once the file has been downloaded.
  console.log("Validating New Version...");

  install();
}

function install() {
  // Unzip the downloaded file here, replacing all of the files which make up the application. A more sophisticated
  // install might allow for deleting old orphaned files which were once used but no longer are.
  console.log("Installing New Version...");
  var zip = new AdmZip(downloadDestination);
  zip.extractAllTo(deploymentDestination, true);
  fs.chmodSync('selfhelp.sh', 0755);

  cleanUpAndTriggerRestart();
}

function cleanUpAndTriggerRestart() {
  console.log("Cleaning Up And Triggering Restart...");

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
    res.end("<p>New Version " + lastPollingResults.version + " Available</p>");
  } else {
    res.end("");
  }
}).listen(1337, "127.0.0.1");

startPolling(pollingURL);
console.log("Server running at http://127.0.0.1:1337/");