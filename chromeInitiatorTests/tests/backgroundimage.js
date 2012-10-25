document.getElementById("backgroundimage6").className = "none"; 
		document.getElementById("backgroundimage7").className = "backgroundimage7";
		document.getElementById("backgroundimage8").style.background = "url(smiley.png?8)";

		var style = document.createElement('style');
		style.type = 'text/css';
		style.innerHTML = '#backgroundimage9 { background: url(smiley.png?9) }';
		document.getElementsByTagName('head')[0].appendChild(style);

var style10 = document.createElement('style');
style10.type = 'text/css';
style10.innerHTML = '#backgroundimage10 { background: url(smiley.png?10) }';
document.getElementsByTagName('head')[0].appendChild(style10);

var expectedTestResults = {
	    	"/smiley.png?1": {
		message: "loading backgroundimage with css rule on id in css file",
		expected: {type: "parser",
					url: "/backgroundimage.css",
					lineNumber: 7}
				},
	    	"/smiley.png?2": {
		message: "loading backgroundimage with css rule on id in style tag in HTML file",
		expected: {type: "parser",
					url: "/test_backgroundimage.html",
					lineNumber: 8}				
				},	    	
	    	"/smiley.png?3": {
					message: "loading backgroundimage with css rule in style attribute on div in HTML file",
					expected: {type: "parser",
								url: "/test_backgroundimage.html",
								lineNumber: 31}				
				},
	    	"/smiley.png?4": {
					message: "loading backgroundimage with css rule on class in style tag",
					expected: {type: "parser",
					url: "/test_backgroundimage.html",
					lineNumber: 11}
							
				}
	    	,
	    	"/smiley.png?5": {
					message: "loading backgroundimage with css rule on class in css file",
					expected: {type: "parser",
					url: "/backgroundimage.css",
					lineNumber: 11}				
				},
	    	"/smiley.png?6": {
					message: "loading backgroundimage with css rule that was later set to display:none",
					expected: {type: "parser",
					url: "/test_backgroundimage.html",
					lineNumber: 14}			
				},
	    	"/smiley.png?7": {
					message: "loading backgroundimage with css rule that was later set to visible",
					expected: {type: "parser",
					url: "/test_backgroundimage.html",
					lineNumber: 17}			
				},
	    	"/smiley.png?8": {message: "backgroundimage style set on node via js",
			expected: {type: "script",
			stackTrace: [{
				url: "/backgroundimage.js",
				lineNumber: 3}]
			}
		},
	    	"/smiley.png?9": {message: "backgroundimage style tag created from js",
			expected: {type: "script",
			stackTrace: [{
				url: "/backgroundimage.js",
				lineNumber: 8}]
			}
		},
		"/smiley.png?10": {message: "backgroundimage style tag created from js",
			expected: {type: "script",
			stackTrace: [{
				url: "/backgroundimage.js",
				lineNumber: 13}]
			}
		}
	    };