# Chrome initiator tests

## Warning: work in progress

Currently this script has only been tested on one machine. Both the code and the test cases need a lot more work, but can be used to get some preliminary results.

## Why?
During development of [Kensho](https://github.com/andydavies/kensho "Kensho: a web resource dependency viewer") and a similar chrome extension to build a web resource tree, it was noticed that the chrome initiator values, used to build the tree, were not always the values that I expected.

This side-project was created to determine in which cases the initiator value from chrome is usefull for the Kensho project and in which cases the values are not usefull for the Kensho project.

## Dependencies and installation

Make sure the following is installed:

- this script requires a [Chrome browser](http://www.google.com/chrome). The executable must be on your path
- [Node.js](http://nodejs.org/download/) The script is currently tested with Node.js version v0.8.12.

Clone the [Kensho](https://github.com/andydavies/kensho "Kensho: a web resource dependency viewer")  repo to a drive on your machine.

The script depends on the [ws module](https://github.com/einaros/ws), which is included in 
the repo so you don't have to install it. The ws module facilitates the communication between Chrome and the testscript using websockets.

## Running the tests
Once everything is installed go the directory where you installed the repo.
Go into the chromeInitiatorTests directory and execute:
    
    node iniatorTests.js

It will run the tests and output the results to the console.

In green the succesfull tests are shown.

In red the tests are shown that have an initiator currently not usefull for Kensho.

In yellow the tests are shown where the initiator url is correct but the linenumber is incorrect. These initiator values **may** be usefull for Kensho, but have to be used with caution.

## How does it work?

The initiatorTests.js script:

- starts a webserver to serve the test html files and other resources from the tests directory.
- it tests if a Chrome instance is running with a remote-debugging port of 9222. If not it will start a Chrome instance with remote debugging on port 9222.
- retrieves a websocket URL from Chrome to drive the Chrome debugger and set up the connection for debugging.
- gather a list of test files from the tests directory.
- Loads each testfile in Chrome and gathers relevant data using the debugger interface.
- It gathers the expected initator data from the HTML testfile.
- It reports on the expected vs the actual initiator data gathered from Chrome.

## how to write your own tests:
TODO

## TODO

- clean up code
- clean up tests
- add initiator tests for other resources: frames, javascript, video, audio, xml, json, fonts, svg and any other resources that may be relevant.
- add more testcases(different ways of loading these resources) for the existing tests.
- create a way of exporting test results.
- make the script configurable.
- when an already running Chrome is used it keeps connections to the webserver open. This prevents the webserver from shutting down.