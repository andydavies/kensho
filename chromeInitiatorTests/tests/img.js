document.getElementById("img2").src = "smiley.png?2";
document.getElementById("img3").src = "smiley.png?3";

var i5 = document.createElement("img");
	i5.src = "smiley.png?5";
i5.id = "img5";
document.getElementById("img5_placeholder").appendChild(i5);

var i6 = document.createElement("img");
i6.id = "img6";
document.getElementById("img6_placeholder").appendChild(i6);
i6.src = "smiley.png?6";

document.getElementById("img7").className = ""; 
document.getElementById("img8").className = "none"; 
// use currenturl for created expected URL's
var expectedTree = {
	"name": "http://wpo-experminents.marcotolk.com.local/resourcetest/img.html",
	"children": [
		//TODO create expected tree for testing in 
	]
};



function loadimg10(){
	var i10 = document.createElement("img");
	i10.src = "smiley.png?10";
	i10.id = "img10";
	document.getElementById("img10_placeholder").appendChild(i10);
}
function loadimg11(){
	var i11 = document.createElement("img");
	i11.src = "smiley.png?11";
	i11.id = "img11";
	document.getElementById("img11_placeholder").appendChild(i11);
}

function loadimg12(){
	var i12 = document.createElement("img");
	i12.src = "smiley.png?12";
	i12.id = "img12";
	document.getElementById("img12_placeholder").appendChild(i12);
}



var i9 = document.createElement("img");
i9.src = "smiley.png?9";
i9.id = "img5";
document.getElementById("img9_placeholder").appendChild(i9);

loadimg10();

function wrapperfunction(){
	loadimg12();
}

if (window.addEventListener){
		window.addEventListener("load", loadimg11, false);
	} else if (window.attachEvent){
		window.attachEvent("onload", loadimg11);
	} else {
		window.onload = loadimg11;
	}

	if (window.addEventListener){
		window.addEventListener("load", wrapperfunction, false);
	} else if (window.attachEvent){
		window.attachEvent("onload", wrapperfunction);
	} else {
		window.onload = wrapperfunction;
	}

	function load13(){
	var i13 = document.createElement("img");
	i13.src = "smiley.png?13";
	i13.id = "img13";
	document.getElementById("img13_placeholder").appendChild(i13);	
}
domready(function () {
  	// dom is loaded!
  	load13();
})

var expectedTestResults = {
	"/smiley.png?1": {
		message: "loading image via img tag in HTML",
		expected: {type: "parser",
					url: "/test_img.html",
					lineNumber: 13}
				},
	"/smiley.png?2": {message: "loading image by setting src of existing img tag from js",
			expected: {type: "script",
			stackTrace: [{
				url: "/img.js",
				lineNumber: 1}]
			}
		},
	"/smiley.png?3": {message: "loading image by adding src of existing img tag from js",
			expected: {type: "script",
			stackTrace: [{
				url: "/img.js",
				lineNumber: 2}]
			}
		},
	"/smiley.png?4": {message: "loading image by creating img tag with document.write",
			expected: {type: "script",
			stackTrace: [{
				url: "/imgwrite.js",
				lineNumber: 2}]
			}
		},
	"/smiley.png?5": {message: "loading image by creating img node from js",
			expected: {type: "script",
			stackTrace: [{
				url: "/img.js",
				lineNumber: 5}]
			}
		},
	"/smiley.png?6": {message: "loading image by creating img node from js altering src after node creation",
			expected: {type: "script",
			stackTrace: [{
				url: "/img.js",
				lineNumber: 12}]
			}
		},
	"/smiley.png?7": {
		message: "loading image via img tag in HTML made visible later via classchange from js",
		expected: {type: "parser",
					url: "/test_img.html",
					lineNumber: 43}
				},
	"/smiley.png?8": {
		message: "loading image via img tag in HTML made invisible later via classchange from js",
		expected: {type: "parser",
					url: "/test_img.html",
					lineNumber: 48}
				},
	"/smiley.png?9": {message: "loading image by creating img node from js",
			expected: {type: "script",
			stackTrace: [{
				url: "/img.js",
				lineNumber: 49}]
			}
		},
	"/smiley.png?10": {message: "loading image by creating img node from jsfunctioncall",
			expected: {type: "script",
			stackTrace: [{
				url: "/img.js",
				lineNumber: 28},{
				url: "/img.js",
				lineNumber: 53}]
			}
		},
	"/smiley.png?11": {message: "loading image by creating img node from js after onload",
			expected: {type: "script",
			stackTrace: [{
				url: "/img.js",
				lineNumber: 34}]
			}
		},
	"/smiley.png?12": {message: "loading image by creating img node from js after onload additional function call",
			expected: {type: "script",
			stackTrace: [
				{url: "/img.js", lineNumber: 41},
				{url: "/img.js",lineNumber:56}]
			} 
		},
	"/smiley.png?13": {message: "loading image by creating img node from js after documentReady",
			expected: {type: "script",
			stackTrace: [
				{url: "/img.js", lineNumber: 77},
				{url: "/img.js",lineNumber:83},
				{url: "/ready.js",lineNumber:22},
				{url: "/ready.js",lineNumber:27}]
			} 
		}
};

