var runner = require('./testRunner');
var url = require("url");

/* Functions for gathering additional data */
function cleanupMatch(match){
    var result = unescape(match);
    var matchFirstquotes = /^'|"/
    var matchLastquotes = /'|"$/
    result = result.replace(matchFirstquotes,'');
    result = result.replace(matchLastquotes,'');
    return result;
}

function getLineNumberForMatch(text, match){
    var str = text.substring(0,match.index);
    return str.split('\n').length;
}

function gatherRelevantInitiatorDataFromCSS(css){
    var source = cssData[css.styleSheet.styleSheetId];
    var urlmatcher = /url\(\s*(\S+)\s*\)/gi;

    var matches = urlmatcher.exec(css.styleSheet.text);
    while(matches !=null) { 
    //FIXME linenumbers are within the stylesheet text, this is wrong for styleblocks within html because it doesn't take into account the lines to where the style tag is placed
            
        addCSSGatheredInitiatorData(url.resolve(source, cleanupMatch(matches[1])), {type: 'parser',url: source, lineNumber: getLineNumberForMatch(css.styleSheet.text,matches)});
        matches = urlmatcher.exec(css.styleSheet.text);
    }

    // @import matches with url can be ignored because they are already matched by the url matcher
    var atImportMatcher = /@import\s*"(\S+)"/gi;
     matches = atImportMatcher.exec(css.styleSheet.text);
    while(matches !=null) {
        //FIXME linenumbers are within the stylesheet text, this is wrong for styleblocks within html because it doesn't take into account the lines to where the style tag is placed
        addCSSGatheredInitiatorData(url.resolve(source, cleanupMatch(matches[1])), {type: 'parser',url: source, lineNumber: getLineNumberForMatch(css.styleSheet.text,matches)});
        matches = atImportMatcher.exec(css.styleSheet.text);
    }
}

function addCSSGatheredInitiatorData(url,gatheredInitiatorData){
    var additionalInitiatorData = runner.getAdditionalInitiatorData();
    if(!additionalInitiatorData.cssData){
        additionalInitiatorData.cssData = {};
    }
    additionalInitiatorData.cssData[url] = gatheredInitiatorData;
}
var cssData = {};
// additional event handler
function cssEventhandler(m){
	if(m.data){
		var data = JSON.parse(m.data);
		if( data.method ===  'Page.loadEventFired'){
            //clean cssdata
            cssData = {};
            runner.sendCommand('CSS.getAllStyleSheets',{},function(x){
                for (var i = 0; i < x.headers.length; i++) {
                    cssData[x.headers[i].styleSheetId] = x.headers[i].sourceURL;
                   runner.sendCommand('CSS.getStyleSheet',{styleSheetId:x.headers[i].styleSheetId},function(css){ 
                        gatherRelevantInitiatorDataFromCSS(css);
                        
                   });
               }
            });
		}
	}
}

function timelineEventhandler(m){
    if(m.data){
        var data = JSON.parse(m.data);
        if( data.method ===  'Timeline.eventRecorded'){
            //clean cssdata
            console.log(',', JSON.stringify(data));
        }
    }


}

/* End functions for gathering additional data */

// function that manipulates initiator data using info from gathered additional data
function improvedInitiator(resourceURL,originalInitiator, extra){

    // TODO FIRST try to determine if the originalInitator is correct can we confirm this?
    // if so return original initiator
//console.log('improvedInitiator',resourceURL, extra);
	if(extra.cssData){
		if(extra.cssData[resourceURL]){
			return extra.cssData[resourceURL];
		}
	}
    // if not search in the additionalInitiatorData for an alternative Initiator
    return originalInitiator;
}




runner.setInitiatorfunctionForTest(improvedInitiator); 
runner.addEventHandler(cssEventhandler);
runner.addEventHandler(timelineEventhandler);
runner.run();
