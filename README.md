# selfhelp

**Deprecated**: I would not use this code anymore. It was an interesting project but these days it would make a lot more sense to start from [Electron](https://electronjs.org/) which has built in support for upgrading the application and which has lots of support for you building cross-platform applications using JavaScript, Node.js, and Chrome.

## Overview

**selfhelp** is not exactly a library, it's more of an example set of code which demonstrates a Node.js server capable of running from the command line which has a web based UI and updating itself to new versions.

It automatically checks for new versions and then (either manually or automatically) downloads, verifies, installs, and restarts itself.

Using this as a starting point you could start out an application the same way Google started out the Chrome browser, as an app capable of installing a new version of itself and almost nothing else. Then build upon that with new versions and know your users are upgrading because it's easy to do so.

## Why do this?

It's not about server apps. Although you could use something like this to auto update a server application, I'm not sure you would. This is about building cross-platform applications using Node.js which users can easily install and run on their own machines and update just like they do the other apps they run. Once you've installed Node.js then installing your application could be made very simple indeed. Look below for my instructions for installing and running **selfhelp** to see just how simple.

The first app I ever ran as a webapp on my machine was the old RSS reader Amphetadesk. I no longer run that one but there are a new generation of applications like SABnzbd+, the Plex Media Server, Couch Potato, and Sick Beard which work well on Mac OS X, Windows, or Linux and your interface to them is through your browser.

I thought  Node.js offered the best medium for building apps like this that I've seen so I thought I'd see if I could do it and how hard it woud be.

## Install and run selfhelp

You're just going to use Git to pull down the repository and start working, but I wrote up some example installation instructions for an app you might write based on this example so you can see how simple it would be:

1. If you don't already have Node.js on your machine, [go here](http://nodejs.org/) and look for the big green Install Node.js button on the Node.js home page. Download the installer and run that.

1. Download and unzip the installation file for the project into a directory on your machine. < You would of course put the link to the installation ZIP file on this line>

1. Run the selfhelp.bat file on Windows or the selfhelp.sh file on Mac/Linux. **selfhelp** will run and launch a page in your browser so you can interact with it. Don't forget to bookmark that page.

## selfhelp Checklist

If you want to build a new Node.js server based upon **selfhelp**, just search for the TODO comments sprinkled through the app.js, Gruntfile.js, and package.json files. But I've gone ahead and done a short summary of the major things below.

1. Add your own Node.js server instead of the stupidly simple example code I've got at the end of the app.js file.

1. Put your own shutdown code (if any) into the gracefulShutdown() function. It will be executed any time nodemon restarts your server.

1. Update the information (especially the version number) in the package.json file to reflect your own application. The example loads that on startup and makes the version number and other info available for display.

## Issues
There really is no validation of the newly downloaded version taking place at the present time. It's just a placeholder function that does nothing.

I don't have a Windows or Linux machine available to me to test this so it hasn't been tested on either one. Nor is there a BAT file or other easy means to launch this on Windows.

Likewise I'm still having some difficulty with launching the app on Mac OS X as well. You have to "chmod +x selfhelp.sh" after installing it the first time and then run ./selfhelp.sh from the command line. That's not what we want end users to do. They just need something to double click to kick it off on any system.

The code related to polling and the download/validate/install/restart cycle all needs to be pulled out into a separate module. In fact it could be made into an npm package at some point.
