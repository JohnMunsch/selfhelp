# selfhelp

**Note: Super important. Everything written below is about what selfhelp will be. I'm still working on it and it's not quite there yet, though it's coming along quickly.
**

## Overview

**selfhelp** is not exactly a library, it's more of an example set of code which demonstrates a Node.js server capable of running from the command line which has a web based UI and self updating to new versions.

It automatically checks for new versions and then (either manually or automatically) downloads, verifies, installs, and restarts itself.

Using this as a starting point you could start out an application the same way Google started out the Chrome browser, as an app capable of installing a new version of itself and almost nothing else. Then build upon that with new versions and know your users are upgrading because it's easy to do so.

## Why do this?

It's not about server apps. Although you could use something like this to auto update a server application, I'm not sure you would. This is about building cross-platform applications using Node.js which users can easily install and run on their own machines and update just like they do the other apps they run. Once you've installed Node.js then installing your application could be made very simple indeed. Look below for my instructions for installing and running **selfhelp** to see just how simple.

The first app I ever ran as a webapp on my machine was the old RSS reader Amphetadesk. I no longer run that one but I actually run several other apps on my machine now that I access through my browser and I think Node.js offers the best medium for building apps like this that I've seen.

## Install and run selfhelp

1. Look for the big green Install Node.js button on the Node.js home page. Download the installer and run that.

1. Download and unzip this file into a directory on your machine.

1. Double click the selfhelp.bat file on Windows or the selfhelp.sh file on Mac/Linux. **selfhelp** will run and launch a page in your browser so you can interact with it. Don't forget to bookmark that page.

## selfhelp Checklist

If you want to build a new Node.js server based upon **selfhelp**, just follow this handy checklist:

1. Add in your own Node.js server instead of my stupidly simple example code.

1. Put your own shutdown code (if any) into the gracefulShutdown() function. It will be executed any time nodemon restarts your server.

1. Figure out where you should host new versions of your application. There needs to be a URL somewhere on the web which **selfhelp** can check, compare the version number of the running version against the version found, and then decide whether a new version is now available.

1. Update the information (especially the version number) in the package.json file to reflect your own application. The example loads that on startup and makes the version number and other info available for display.

1. Make sure the delay setting in selfhelp.sh and selfhelp.bat is set to an appropriate length. If not then nodemon will restart your app multiple times during the installation of a new version.