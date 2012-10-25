var link6=document.createElement("link");
link6.setAttribute("rel", "stylesheet");
link6.setAttribute("type", "text/css");
link6.setAttribute("href", "css6.css");
document.getElementsByTagName('head')[0].appendChild(link6);

var link7=document.createElement("link");
link7.setAttribute("rel", "stylesheet");
link7.setAttribute("type", "text/css");
document.getElementsByTagName('head')[0].appendChild(link7); 
link7.setAttribute("href", "css7.css");

var expectedTestResults = {
	"/css1.css": {
		message: "loading css via link href tag in HTML",
		expected: {type: "parser",
					url: "/test_css.html",
					lineNumber: 4}
				},
	"/css2.css": {message: "loading css via @import from other css file",
			expected: {type: "parser",url: "/css1.css",lineNumber: 1}},
	"/css3.css": {
					message: "loading css via @import from other css file",
					expected: {
						type: "parser",
						url: "/css2.css",
						lineNumber: 3
					}
				},
	"/css4.css": {
		message: "loading via @import in style tag",
		expected: {type: "parser",url: "/test_css.html",lineNumber: 6}
	},
	"/css5.css": {message: "loading css via document.write() in external js file",
			expected: {type: "script",
			stackTrace: [{
				url: "/csswrite.js",
				lineNumber: 2}]
			}
		},
	"/css6.css": {message: "loading css via dominsert of link+href tag",
			expected: {type: "script",
			stackTrace: [{
				url: "/css.js",
				lineNumber: 5}]
			}
		},
	"/css7.css": {message: "loading css via dominsert of link, setting the href later via js",
			expected: {type: "script",
				stackTrace: [{
					url: "/css.js",
					lineNumber: 11}]
				}
			}
};