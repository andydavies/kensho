console.log('Start Chrome Initiator tests');

// To easily use colors in the console output different styles are added to String
var styles = {
  'bold':      ['\033[1m', '\033[22m'],
  'italic':    ['\033[3m', '\033[23m'],
  'underline': ['\033[4m', '\033[24m'],
  'inverse':   ['\033[7m', '\033[27m'],
  'black':     ['\033[30m', '\033[39m'],
  'red':       ['\033[31m', '\033[39m'],
  'green':     ['\033[32m', '\033[39m'],
  'yellow':    ['\033[33m', '\033[39m'],
  'white':     ['\033[37m', '\033[39m'],
  'default':   ['\033[39m', '\033[39m'],
  'bgDefault': ['\033[49m', '\033[49m']
}
Object.keys(styles).forEach(function(style) {
  Object.defineProperty(String.prototype, style, {
    get: function() { return styles[style][0] + this + styles[style][1]; },
    enumerable: false
  });
});




var http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs"),
    assert = require('assert'),
    webserverport = 8888;

var createdChromeInstance = false;
var expectedInitiators = {};
var retrievedInitiators = {};
// create testwebserver to host the testfiles in ./tests
var testWebserver = require('./testWebserver.js');
testWebserver.start();

/*
 * Make sure a chrome instance with remote debugging is running.
 */
var spawn = require('child_process').spawn,
    child;
var remoteDebuggeroptions = {
  host: 'localhost',
  port: 9222,
  path: '/json',
  method: 'GET'
};

// attempt to read the localhost:9222/json chrome debugger configuration
var req = http.request(remoteDebuggeroptions, debuggerJsonHandler);
req.on('error', function(e) {  

    var chromeexecutableConfig = {
        win32: 'chrome',
        win64: 'chrome',
        linux: 'google-chrome'
    }
	// remote debugger not running attempt to start remote debugger
    var chromeExecutable = 'chrome'; // assume this as default.
    var platform = require('os').platform();
    if(chromeexecutableConfig[platform]){
        chromeExecutable = chromeexecutableConfig[platform];
    }
	console.log('remote debugger not running attempting to start '+chromeExecutable+' --remote-debugging-port=9222');
    // chrome must be opened with a regular html page. the debugger via webseockets and non html pages like extension pages and other chrome internal pages don't mix well.
	child = spawn(chromeExecutable,['--remote-debugging-port=9222', 'http://google.com']);
	// give chrome process time to start
    createdChromeInstance = true;
    setTimeout(function(){http.request(remoteDebuggeroptions, debuggerJsonHandler).end();},2000);
 });
req.end();



/*
 * Given the json result of http://localhost:9222/json the remote debugger details returns the first websocket url to use for remote debugging
 */
function findwebsocketUrl(chromejsonconfig){
    for (var i = 0; i < chromejsonconfig.length; i++) {
        if(chromejsonconfig[i].webSocketDebuggerUrl){
            return chromejsonconfig[i].webSocketDebuggerUrl;
        }
    }
    return undefined;
}

/*
 * Retrieve a valid websocket URL for the chrome remote debugger config
 */
var chromeDevtools;
function debuggerJsonHandler(response){
	var pageData = '';
	response.on('data', function (chunk) {
	      pageData += chunk;
	    });
	response.on('end', function(){
	      //console.log('debugger config',pageData);
	      var chromeconfig = JSON.parse(pageData);
	      var devtoolsUrl = findwebsocketUrl(chromeconfig);
	      var WebSocket = require('ws');
	      //console.log('connecting to', devtoolsUrl);

	      chromeDevtools = new WebSocket(devtoolsUrl);
	      chromeDevtools.on('open', function() {
			    //console.log('connection opened');
			    prepareDebugger();
		  });
	      
	      
	    });

}

function getTestPages(){
    var dirFiles = fs.readdirSync('./tests');
    
    var testFiles = [];
    for (var i = 0; i < dirFiles.length; i++) {
        if(dirFiles[i].indexOf('test_') == 0){
            testFiles.push(dirFiles[i]);
        }
    }
    return testFiles;
}
var testPages = [];

/*
 * Get's a file to test from the testPages array and starts the test, when there are no more tests stop the script -> cleanup.
 */
function runNextTest(){
	if(testPages.length > 0){
		var URLToTest = 'http://localhost:' + webserverport + '/' + testPages.pop();
		console.log('loading ' , URLToTest);
        // settimeout used to give page time to load before the evaluate is fired
		sendCommand('Page.navigate',{url: URLToTest}, function(){ setTimeout(inspectPageBeforeTest,2000);});
	} else {
		console.log('done testing. now cleanup.');
		cleanup();
	}
}


/*
 * Sets up the debugger correctly so it gathers all the required events from Page and Network and reloads.
 * Ignore cache is used to make sure all requests are fired.
 */
function runTest(){
	// enable networkl events
	sendCommand('Network.enable',{}, function(){
		sendCommand('Page.enable',{}, function(){
            sendCommand('Timeline.start',{}, function(){
                sendCommand('Page.reload',{ignoreCache: true}, function(){/*console.log('page navigated');*/});
            });
		});
	});

	
	// disbale network events when done

	// compare results.

}

// try to retrieve expectedvalues from page. Expected Values is a javascript object that should be available in every testfile.
function inspectPageBeforeTest(){
	// reset data
	expectedInitiators = {};
	retrievedInitiators = {};
	sendCommand('Runtime.evaluate',{expression: 'expectedTestResults;',returnByValue: true},function(result){
		if(result.result.value){
			expectedInitiators = result.result.value;
            runTest();
		} else {
            console.error('required javascript object expectedTestResults could not be retrieved from page. Skipped TEST', JSON.stringify(result));
            runNextTest();
        }
    });
}

// utility function to deep-clone an object
function simpleclone(o){
    return JSON.parse(JSON.stringify(o));
}

// strips linenumber data from initiator objects.
function stripLineNumbers(o){
    if(o.lineNumber){
        delete o.lineNumber;
    }
    if(o.stackTrace){
        for (var i = 0; i < o.stackTrace.length; i++) {
            delete o.stackTrace[i].lineNumber;
        }
    }
    return o;
}

// Tests if 
function isDeepEqualwithoutLineNumbers(actual, expected){
// a really naive way of testing but requires no dependency on another unittesting framework. Now the easiest way of getting started without investigating 
// other frameworks that could do this (better).
    try{
        assert.deepEqual(stripLineNumbers(simpleclone(actual)),stripLineNumbers(simpleclone(expected)));
        return true;
    } catch (err){
        return false
    }
}

function reportTest(){

    //gather other data through Page.searchinresources to search for @import, backgroundimages
    // search in resources is a last resort


    // fix url's from relative in expected to absolute
    for (var key in expectedInitiators) {
        if(expectedInitiators[key]){
            if(expectedInitiators[key].expected){
                if(expectedInitiators[key].expected.url){
                    expectedInitiators[key].expected.url = 'http://localhost:8888' + expectedInitiators[key].expected.url;
                    //console.log('FIXED',expectedInitiators[key].expected.url);
                }
                if(expectedInitiators[key].expected.stackTrace){
                    for (var i = 0; i < expectedInitiators[key].expected.stackTrace.length; i++) {
                        expectedInitiators[key].expected.stackTrace[i].url = 'http://localhost:8888' + expectedInitiators[key].expected.stackTrace[i].url;
                    }
                }
            }
        }
    }

    // remove fields we don't need for these tests from actual, so we don't need to maintain them in the test cases function and columnnumber
    // this data is not needed for the current tests.
    for (var key in retrievedInitiators) {
        if(retrievedInitiators[key]){
            if(retrievedInitiators[key].stackTrace  ){
                 for (var i = 0; i < retrievedInitiators[key].stackTrace.length; i++) {
                    var jsref = retrievedInitiators[key].stackTrace[i];
                    delete jsref.functionName;
                    delete jsref.columnNumber;
                 }
            }
        }
    }
    for (var key in expectedInitiators) {
        if(expectedInitiators[key]){
            if(expectedInitiators[key].expected && expectedInitiators[key].message){
                try{
                    assert.deepEqual(retrievedInitiators[key],expectedInitiators[key].expected,expectedInitiators[key].message);
                    console.log(('INITIATOR SUCCES['+key +']: '+expectedInitiators[key].message).green );
                } catch (err){
                    if(isDeepEqualwithoutLineNumbers(retrievedInitiators[key],expectedInitiators[key].expected)) {
                        console.log(('INITIATOR PARTIAL SUCCES['+key +'] - correct URL with incorrect linenumber -: '+expectedInitiators[key].message).yellow );
                        if(retrievedInitiators[key]){
                            console.log('actual'.yellow, JSON.stringify(retrievedInitiators[key]).yellow);    
                        } else {
                            console.log('actual UNDEFINED'.yellow);
                        }
                        
                        console.log('expected'.yellow,JSON.stringify(expectedInitiators[key].expected).yellow);
                    } else {
                        console.error(('INITIATOR FAILED['+key +']: '+expectedInitiators[key].message).red);
                        if(retrievedInitiators[key]){
                            console.log('actual'.red, JSON.stringify(retrievedInitiators[key]).red);    
                        } else {
                            console.log('actual UNDEFINED'.red);
                        }
                        
                        console.log('expected'.red,JSON.stringify(expectedInitiators[key].expected).red);
                        console.error('END INITIATOR FAILED:'.red);
                }
                }
            }
        }
    }
	// cleanup debugger settings
	sendCommand('Network.disable',{}, function(){
		sendCommand('Page.disable',{}, function(){
            sendCommand('Timeline.stop',{}, function(){
                runNextTest();
            });
		});
	});
}

function improveInitiator(originalInitiator, initiatorForResourceURL){

    return originalInitiator;
}

// the event handler that handles all events from the websocket.
function devtoolsEventhandler(m){

	    if(m.data){
	    	//console.log(m.data);
	    	var data = JSON.parse(m.data);
            // if it contains a result and an id we look up the registered callback in wscallbacks and execute it. It's the response to a message sent to the chrome debugger.
	    	if(data.result && data.id){
	    		if(wscallbacks[data.id]){
	    			//console.log('executed callback for wsid: ' +data.id );
	    			wscallbacks[data.id](data.result);
	    		}
	    	} else if(data.method){
                // when the loadevent fires wait one second for onload events to complete and then create the report.
	    		if( data.method ===  'Page.loadEventFired'){

                    /*sendCommand('CSS.getAllStyleSheets',{},function(x){
                        for (var i = 0; i < x.headers.length; i++) {
                           sendCommand('CSS.getStyleSheet',{styleSheetId:x.headers[i].styleSheetId},function(css){ 
                                console.log(JSON.stringify(css));
                           });
                       }
                        console.log('allstylesheets', JSON.stringify(x));
                    });*/
	    			setTimeout(reportTest,1000);
                // this event contains the initiator data. when there's a testcase for it store the initiator data.
	    		} else if(data.method === 'Network.requestWillBeSent'){
	    			//console.log('Network.requestWillBeSent',data.params.request.url,data.params.initiator);
	    			var name = url.parse(data.params.request.url).path;
	    			//console.log('NAME',name,expectedInitiators);

	    			if(expectedInitiators.hasOwnProperty(name)){
	    				
	    				retrievedInitiators[name] = data.params.initiator;
	    			}
	    		} else /*if(data.method === 'Timeline.eventRecorded'){
	    			console.log('Timeline.eventRecorded'.red,JSON.stringify(data.params));

	    		}  else */ if(data.method === 'Profiler.resetProfiles'){
                    // websocket connection invalidated by chrome debugger restart whole test
                    console.log('Websocket was reset by browser, restarting test.');
                    if(chromeDevtools){
                        chromeDevtools.close();
                        setTimeout(function(){http.request(remoteDebuggeroptions, debuggerJsonHandler).end();},3000);
                    } else {
                        http.request(remoteDebuggeroptions, debuggerJsonHandler).end();
                    }
                } else { //ignore all other events
	    			//console.log(data.method);
	    		}

	    	}
	    }
	}

var sys = require('sys');
// gather the testfiles and register the eventhandler for the websocket then start the tests.
function prepareDebugger(){
    //reset the pages to be tested
    testPages = getTestPages();

	chromeDevtools.onmessage = devtoolsEventhandler;
	chromeDevtools.addListener('data', function(buf) {
	    console.log('Got data: ' + sys.inspect(buf));
	});
    //sendCommand('Profiler.disable',{},runNextTest);
	runNextTest();
	//setTimeout(cleanup, 10000);
}
var websocketid = 1;
var wscallbacks = {};

// easy wrapper around sending commands to chrome debugger and handling callbacks.
function sendCommand(command, params, callback){
	var wsid = websocketid++;
	commandobject = {
		id: wsid,
		method: command,
		params: params
	};
	wscallbacks[wsid.toString()] = callback;
	chromeDevtools.send(JSON.stringify(commandobject),{},function(){/*console.log('command sent',JSON.stringify(commandobject));*/});
}




function cleanup(){
    // keeping a reference to page in the webserver seems to keep the webserver open
    sendCommand('Page.navigate',{url: 'about:blank'});
	if(createdChromeInstance){
		// kill the child
		child.kill();
	}
	testWebserver.stop();
}