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

// extension to mimetype  for webserver
ext_to_type = {
        '.323'     : 'text/h323',
        '.3gp'     : 'video/3gpp',
        '.a'       : 'application/octet-stream',
        '.acx'     : 'application/internet-property-stream',
        '.ai'      : 'application/postscript',
        '.aif'     : 'audio/x-aiff',
        '.aifc'    : 'audio/x-aiff',
        '.aiff'    : 'audio/x-aiff',
        '.asc'     : 'application/pgp-signature',
        '.asf'     : 'video/x-ms-asf',
        '.asr'     : 'video/x-ms-asf',
        '.asm'     : 'text/x-asm',
        '.asx'     : 'video/x-ms-asf',
        '.atom'    : 'application/atom+xml',
        '.au'      : 'audio/basic',
        '.avi'     : 'video/x-msvideo',
        '.axs'     : 'application/olescript',
        '.bas'     : 'text/plain',
        '.bat'     : 'application/x-msdownload',
        '.bcpio'   : 'application/x-bcpio',
        '.bin'     : 'application/octet-stream',
        '.bmp'     : 'image/bmp',
        '.bz2'     : 'application/x-bzip2',
        '.c'       : 'text/x-c',
        '.cab'     : 'application/vnd.ms-cab-compressed',
        '.cat'     : 'application/vnd.ms-pkiseccat',
        '.cc'      : 'text/x-c',
        '.cdf'     : 'application/x-netcdf',
        '.cer'     : 'application/x-x509-ca-cert',
        '.cgm'     : 'image/cgm',
        '.chm'     : 'application/vnd.ms-htmlhelp',
        '.class'   : 'application/octet-stream',
        '.clp'     : 'application/x-msclip',
        '.cmx'     : 'image/x-cmx',
        '.cod'     : 'image/cis-cod',
        '.com'     : 'application/x-msdownload',
        '.conf'    : 'text/plain',
        '.cpio'    : 'application/x-cpio',
        '.cpp'     : 'text/x-c',
        '.cpt'     : 'application/mac-compactpro',
        '.crd'     : 'application/x-mscardfile',
        '.crl'     : 'application/pkix-crl',
        '.crt'     : 'application/x-x509-ca-cert',
        '.csh'     : 'application/x-csh',
        '.css'     : 'text/css',
        '.csv'     : 'text/csv',
        '.cxx'     : 'text/x-c',
        '.dcr'     : 'application/x-director',
        '.deb'     : 'application/x-debian-package',
        '.der'     : 'application/x-x509-ca-cert',
        '.diff'    : 'text/x-diff',
        '.dir'     : 'application/x-director',
        '.djv'     : 'image/vnd.djvu',
        '.djvu'    : 'image/vnd.djvu',
        '.dll'     : 'application/x-msdownload',
        '.dmg'     : 'application/octet-stream',
        '.dms'     : 'application/octet-stream',
        '.doc'     : 'application/msword',
        '.dot'     : 'application/msword',
        '.dtd'     : 'application/xml-dtd',
        '.dv'      : 'video/x-dv',
        '.dvi'     : 'application/x-dvi',
        '.dxr'     : 'application/x-director',
        '.ear'     : 'application/java-archive',
        '.eml'     : 'message/rfc822',
        '.eps'     : 'application/postscript',
        '.etx'     : 'text/x-setext',
        '.evy'     : 'application/envoy',
        '.exe'     : 'application/x-msdownload',
        '.ez'      : 'application/andrew-inset',
        '.f'       : 'text/x-fortran',
        '.f77'     : 'text/x-fortran',
        '.f90'     : 'text/x-fortran',
        '.fif'     : 'application/fractals',
        '.flr'     : 'x-world/x-vrml',
        '.flv'     : 'video/x-flv',
        '.for'     : 'text/x-fortran',
        '.gem'     : 'application/octet-stream',
        '.gemspec' : 'text/x-script.ruby',
        '.gif'     : 'image/gif',
        '.gram'    : 'application/srgs',
        '.grxml'   : 'application/srgs+xml',
        '.gtar'    : 'application/x-gtar',
        '.gz'      : 'application/x-gzip',
        '.h'       : 'text/x-c',
        '.hdf'     : 'application/x-hdf',
        '.hh'      : 'text/x-c',
        '.hlp'     : 'application/winhlp',
        '.hqx'     : 'application/mac-binhex40',
        '.hta'     : 'application/hta',
        '.htc'     : 'text/x-component',
        '.htm'     : 'text/html',
        '.html'    : 'text/html',
        '.htt'     : 'text/webviewhtml',
        '.ice'     : 'x-conference/x-cooltalk',
        '.ico'     : 'image/vnd.microsoft.icon',
        '.ics'     : 'text/calendar',
        '.ief'     : 'image/ief',
        '.ifb'     : 'text/calendar',
        '.iges'    : 'model/iges',
        '.igs'     : 'model/iges',
        '.iii'     : 'application/x-iphone',
        '.ins'     : 'application/x-internet-signup',
        '.isp'     : 'application/x-internet-signup',
        '.iso'     : 'application/octet-stream',
        '.jar'     : 'application/java-archive',
        '.java'    : 'text/x-java-source',
        '.jfif'    : 'image/pipeg',
        '.jnlp'    : 'application/x-java-jnlp-file',
        '.jp2'     : 'image/jp2',
        '.jpe'     : 'image/jpeg',
        '.jpeg'    : 'image/jpeg',
        '.jpg'     : 'image/jpeg',
        '.js'      : 'application/javascript',
        '.json'    : 'application/json',
        '.kar'     : 'audio/midi',
        '.latex'   : 'application/x-latex',
        '.lha'     : 'application/octet-stream',
        '.lsf'     : 'video/x-la-asf',
        '.lsx'     : 'video/x-la-asf',
        '.lzh'     : 'application/octet-stream',
        '.log'     : 'text/plain',
        '.m13'     : 'application/x-msmediaview',
        '.m14'     : 'application/x-msmediaview',
        '.m3u'     : 'audio/x-mpegurl',
        '.m4a'     : 'audio/mp4a-latm',
        '.m4b'     : 'audio/mp4a-latm',
        '.m4p'     : 'audio/mp4a-latm',
        '.m4u'     : 'video/vnd.mpegurl',
        '.m4v'     : 'video/mp4',
        '.mac'     : 'image/x-macpaint',
        '.man'     : 'text/troff',
        '.mathml'  : 'application/mathml+xml',
        '.mbox'    : 'application/mbox',
        '.mdb'     : 'application/x-msaccess',
        '.mdoc'    : 'text/troff',
        '.me'      : 'text/troff',
        '.mesh'    : 'model/mesh',
        '.mht'     : 'message/rfc822',
        '.mhtml'   : 'message/rfc822',
        '.mid'     : 'audio/midi',
        '.midi'    : 'audio/midi',
        '.mif'     : 'application/vnd.mif',
        '.mime'    : 'message/rfc822',
        '.mml'     : 'application/mathml+xml',
        '.mng'     : 'video/x-mng',
        '.mny'     : 'application/x-msmoney',
        '.mov'     : 'video/quicktime',
        '.movie'   : 'video/x-sgi-movie',
        '.mp2'     : 'video/mpeg',
        '.mp3'     : 'audio/mpeg',
        '.mp4'     : 'video/mp4',
        '.mp4v'    : 'video/mp4',
        '.mpa'     : 'video/mpeg',
        '.mpe'     : 'video/mpeg',
        '.mpeg'    : 'video/mpeg',
        '.mpg'     : 'video/mpeg',
        '.mpga'    : 'audio/mpeg',
        '.mpp'     : 'application/vnd.ms-project',
        '.mpv2'    : 'video/mpeg',
        '.ms'      : 'text/troff',
        '.msh'     : 'model/mesh',
        '.msi'     : 'application/x-msdownload',
        '.mvb'     : 'application/x-msmediaview',
        '.mxu'     : 'video/vnd.mpegurl',
        '.nc'      : 'application/x-netcdf',
        '.nws'     : 'message/rfc822',
        '.oda'     : 'application/oda',
        '.odp'     : 'application/vnd.oasis.opendocument.presentation',
        '.ods'     : 'application/vnd.oasis.opendocument.spreadsheet',
        '.odt'     : 'application/vnd.oasis.opendocument.text',
        '.ogg'     : 'application/ogg',
        '.p'       : 'text/x-pascal',
        '.p10'     : 'application/pkcs10',
        '.p12'     : 'application/x-pkcs12',
        '.p7b'     : 'application/x-pkcs7-certificates',
        '.p7c'     : 'application/x-pkcs7-mime',
        '.p7m'     : 'application/x-pkcs7-mime',
        '.p7r'     : 'application/x-pkcs7-certreqresp',
        '.p7s'     : 'application/x-pkcs7-signature',
        '.pas'     : 'text/x-pascal',
        '.pbm'     : 'image/x-portable-bitmap',
        '.pct'     : 'image/pict',
        '.pdb'     : 'chemical/x-pdb',
        '.pdf'     : 'application/pdf',
        '.pem'     : 'application/x-x509-ca-cert',
        '.pfx'     : 'application/x-pkcs12',
        '.pgm'     : 'image/x-portable-graymap',
        '.pgn'     : 'application/x-chess-pgn',
        '.pgp'     : 'application/pgp-encrypted',
        '.pic'     : 'image/pict',
        '.pict'    : 'image/pict',
        '.pkg'     : 'application/octet-stream',
        '.pko'     : 'application/ynd.ms-pkipko',
        '.pl'      : 'text/x-script.perl',
        '.pm'      : 'text/x-script.perl-module',
        '.pma'     : 'application/x-perfmon',
        '.pmc'     : 'application/x-perfmon',
        '.pml'     : 'application/x-perfmon',
        '.pmr'     : 'application/x-perfmon',
        '.pmw'     : 'application/x-perfmon',
        '.png'     : 'image/png',
        '.pnm'     : 'image/x-portable-anymap',
        '.pnt'     : 'image/x-macpaint',
        '.pntg'    : 'image/x-macpaint',
        '.pot'     : 'application/vnd.ms-powerpoint',
        '.ppm'     : 'image/x-portable-pixmap',
        '.pps'     : 'application/vnd.ms-powerpoint',
        '.ppt'     : 'application/vnd.ms-powerpoint',
        '.prf'     : 'application/pics-rules',
        '.ps'      : 'application/postscript',
        '.psd'     : 'image/vnd.adobe.photoshop',
        '.pub'     : 'application/x-mspublisher',
        '.py'      : 'text/x-script.python',
        '.qt'      : 'video/quicktime',
        '.qti'     : 'image/x-quicktime',
        '.qtif'    : 'image/x-quicktime',
        '.ra'      : 'audio/x-pn-realaudio',
        '.rake'    : 'text/x-script.ruby',
        '.ram'     : 'audio/x-pn-realaudio',
        '.rar'     : 'application/x-rar-compressed',
        '.ras'     : 'image/x-cmu-raster',
        '.rb'      : 'text/x-script.ruby',
        '.rdf'     : 'application/rdf+xml',
        '.rgb'     : 'image/x-rgb',
        '.rm'      : 'application/vnd.rn-realmedia',
        '.rmi'     : 'audio/mid',
        '.roff'    : 'text/troff',
        '.rpm'     : 'application/x-redhat-package-manager',
        '.rss'     : 'application/rss+xml',
        '.rtf'     : 'application/rtf',
        '.rtx'     : 'text/richtext',
        '.ru'      : 'text/x-script.ruby',
        '.s'       : 'text/x-asm',
        '.scd'     : 'application/x-msschedule',
        '.sct'     : 'text/scriptlet',
        '.setpay'  : 'application/set-payment-initiation',
        '.setreg'  : 'application/set-registration-initiation',
        '.sgm'     : 'text/sgml',
        '.sgml'    : 'text/sgml',
        '.sh'      : 'application/x-sh',
        '.shar'    : 'application/x-shar',
        '.sig'     : 'application/pgp-signature',
        '.silo'    : 'model/mesh',
        '.sit'     : 'application/x-stuffit',
        '.skd'     : 'application/x-koan',
        '.skm'     : 'application/x-koan',
        '.skp'     : 'application/x-koan',
        '.skt'     : 'application/x-koan',
        '.smi'     : 'application/smil',
        '.smil'    : 'application/smil',
        '.snd'     : 'audio/basic',
        '.so'      : 'application/octet-stream',
        '.spc'     : 'application/x-pkcs7-certificates',
        '.spl'     : 'application/x-futuresplash',
        '.src'     : 'application/x-wais-source',
        '.sst'     : 'application/vnd.ms-pkicertstore',
        '.stl'     : 'application/vnd.ms-pkistl',
        '.stm'     : 'text/html',
        '.sv4cpio' : 'application/x-sv4cpio',
        '.sv4crc'  : 'application/x-sv4crc',
        '.svg'     : 'image/svg+xml',
        '.svgz'    : 'image/svg+xml',
        '.swf'     : 'application/x-shockwave-flash',
        '.t'       : 'text/troff',
        '.tar'     : 'application/x-tar',
        '.tbz'     : 'application/x-bzip-compressed-tar',
        '.tcl'     : 'application/x-tcl',
        '.tex'     : 'application/x-tex',
        '.texi'    : 'application/x-texinfo',
        '.texinfo' : 'application/x-texinfo',
        '.text'    : 'text/plain',
        '.tgz'     : 'application/x-compressed',
        '.tif'     : 'image/tiff',
        '.tiff'    : 'image/tiff',
        '.torrent' : 'application/x-bittorrent',
        '.tr'      : 'text/troff',
        '.trm'     : 'application/x-msterminal',
        '.tsv'     : 'text/tab-seperated-values',
        '.txt'     : 'text/plain',
        '.uls'     : 'text/iuls',
        '.ustar'   : 'application/x-ustar',
        '.vcd'     : 'application/x-cdlink',
        '.vcf'     : 'text/x-vcard',
        '.vcs'     : 'text/x-vcalendar',
        '.vrml'    : 'model/vrml',
        '.vxml'    : 'application/voicexml+xml',
        '.war'     : 'application/java-archive',
        '.wav'     : 'audio/x-wav',
        '.wbmp'    : 'image/vnd.wap.wbmp',
        '.wbxml'   : 'application/vnd.wap.wbxml',
        '.wcm'     : 'application/vnd.ms-works',
        '.wdb'     : 'application/vnd.ms-works',
        '.wks'     : 'application/vnd.ms-works',
        '.wma'     : 'audio/x-ms-wma',
        '.wmf'     : 'application/x-msmetafile',
        '.wml'     : 'text/vnd.wap.wml',
        '.wmls'    : 'text/vnd.wap.wmlscript',
        '.wmlsc'   : 'application/vnd.wap.wmlscriptc',
        '.wmv'     : 'video/x-ms-wmv',
        '.wmx'     : 'video/x-ms-wmx',
        '.wps'     : 'application/vnd.ms-works',
        '.wri'     : 'application/x-mswrite',
        '.wrl'     : 'model/vrml',
        '.wrz'     : 'x-world/x-vrml',
        '.wsdl'    : 'application/wsdl+xml',
        '.xaf'     : 'x-world/x-vrml',
        '.xbm'     : 'image/x-xbitmap',
        '.xht'     : 'application/xhtml+xml',
        '.xhtml'   : 'application/xhtml+xml',
        '.xla'     : 'application/vnd.ms-excel',
        '.xlc'     : 'application/vnd.ms-excel',
        '.xlm'     : 'application/vnd.ms-excel',
        '.xls'     : 'application/vnd.ms-excel',
        '.xlt'     : 'application/vnd.ms-excel',
        '.xml'     : 'application/xml',
        '.xof'     : 'x-world/x-vrml',
        '.xpm'     : 'image/x-xpixmap',
        '.xsl'     : 'application/xml',
        '.xslt'    : 'application/xslt+xml',
        '.xul'     : 'application/vnd.mozilla.xul+xml',
        '.xwd'     : 'image/x-xwindowdump',
        '.xyz'     : 'chemical/x-xyz',
        '.yaml'    : 'text/yaml',
        '.yml'     : 'text/yaml',
        '.z'       : 'application/x-compress',
        '.zip'     : 'application/zip'
    }; 

// create webserver to run testfiles
// Connection: close is used to prevent keepalive connections to the webserver. Keepalive connections prevent the webserver 
// from shutting down gracefully when the browser remains opened FIXME doesn't seem to do the trick though
 var webserver = http.createServer(function(request, response) {

  	var uri = url.parse(request.url).pathname,
     	filename = './tests'+ uri;

    fs.exists(filename, function (exists) {
    	if(exists){
    		fs.readFile(filename, "binary", function(err, file) {
		      if(err) {        
		        response.writeHead(500, {"Content-Type": "text/plain","Connection": "close"});
		        response.write(err + "\n");
		        response.end();
		        return;
		      }
		      var mime = "text/plain"; // default
		      if(ext_to_type[path.extname(filename)] ) {
		      	mime = ext_to_type[path.extname(filename)];
		      }

		      response.writeHead(200, {"Content-Type": mime,"Connection": "close"});
		      response.write(file, "binary");
		      response.end();
		    });
    	} else {
    	  response.writeHead(404, {"Content-Type": "text/plain","Connection": "close"});
	      response.write("404 Not Found\n");
	      response.end();
	      return;
    	}
    });
}).listen(webserverport);

console.log("Static file webserver running at\n  => http://localhost:" + webserverport );

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
	if(webserver){
		//stop the webserver
		webserver.close(function(){console.log('webserver stopped');});
	}
}