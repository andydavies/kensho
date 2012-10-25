	document.getElementById('iframe2').src="framecontents.html?2";
	document.getElementById('iframe3').src="framecontents.html?3";

	var i5 = document.createElement("iframe");
	i5.scrolling = "auto";
	i5.frameborder = "0";
	i5.width = "200px";
	i5.height = "50px";
	i5.id = "iframe5";
	i5.src = "framecontents.html?5";
	document.getElementById("iframe_placeholder5").appendChild(i5);

	var i6 = document.createElement("iframe");
	i6.scrolling = "auto";
	i6.frameborder = "0";
	i6.width = "200px";
	i6.height = "50px";
	i6.id = "iframe6";
	document.getElementById("iframe_placeholder6").appendChild(i6);
    i6.src = "framecontents.html?6";


    var expectedTestResults = {
    	"/framecontents.html?1": {
		message: "loading iframe via iframe tag in HTML",
		expected: {type: "parser",
					url: "/iframe_css.html",
					lineNumber: 9}
				},
    	"/framecontents.html?2": {message: "loading iframe by setting src on existing iframe",
			expected: {type: "script",
			stackTrace: [{
				url: "/iframes.js",
				lineNumber: 1}]
			}
		},
    	"/framecontents.html?3": {message: "loading iframe by adding src on existing iframe",
			expected: {type: "script",
			stackTrace: [{
				url: "/iframes.js",
				lineNumber: 2}]
			}
		},
    	"/framecontents.html?4": {message: "loading iframe creating iframe tag with document.write",
			expected: {type: "script",
			stackTrace: [{
				url: "/iframeswrite.js",
				lineNumber: 1}]
			}
		},
    	"/framecontents.html?5": {message: "loading iframe by creating iframe node from js",
			expected: {type: "script",
			stackTrace: [{
				url: "/iframes.js",
				lineNumber: 11}]
			}
		},
    	"/framecontents.html?6": {message: "loading iframe by creating iframe node from js and setting source after node creation",
			expected: {type: "script",
			stackTrace: [{
				url: "/iframes.js",
				lineNumber: 20}]
			}
		}
    };