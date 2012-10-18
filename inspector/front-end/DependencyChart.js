/*
 * Copyright (C) 2012 Andy Davies <hello@andydavies.me>
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */


/**
 * @constructor
 * @param {WebInspector.NetworkRequest} request
 */
WebInspector.DependencyTreeNode = function(request)
{
    this._request = request;
}

WebInspector.DependencyTreeNode.prototype = {
    /**
     * @return {WebInspector.DependencyTreeNode}
     */
    build: function()
    {
    	return {
    		url : this._request.url,
    		parent : this._getParent(),
    		type : this._request._type._name, //AD-FIXME: Should really be mimetype
    		color: this._request._type._color, //AD-FIXME: Colors should be in visualisation not data tree
    		size : this._request.resourceSize,
    		transferSize : this._request.transferSize,
    		children : []
    	}
    },

	/**
	 * @return {String}
	 *
	 * AD - This code is lifted from WebInspector.NetworkDataGridNode._refreshInitiatorCell
	 * FIXME:
	 *  Script handling needs reviewing in light of Bryan McQuade's comments
	 *  about resource loaders
	 */
    _getParent: function() 
    {
    	var parent = null;

		var initiator = this._request.initiator;

		if ((initiator && initiator.type !== "other") || this._request.redirectSource) {
			if (this._request.redirectSource) {
				parent = this._request.redirectSource.url;
			}
			else if (initiator.type === "script") {	
	            var topFrame = initiator.stackTrace[0];
	            // This could happen when request loading was triggered by console.
	            if (topFrame.url) {
	                parent = topFrame.url;
	            }
            }
            else {
            	parent = initiator.url;
            }
        }

    	return parent;
    }
}

/**
 * @constructor
 * @param {Array.<WebInspector.NetworkRequest>} requests
 */
WebInspector.DependencyTree = function(requests)
{
    this._requests = requests; //AD-FIXME: Should be parameter to build()
    this._tree = [];
}

WebInspector.DependencyTree.prototype = {
    /**
     * @return {Object}
     */
    build: function()
    {
    	// Add root to empty tree
    	if (this._requests.length > 0) {
			var newNode = this._createNode(this._requests[0]);
            this._tree.push(newNode);
    	}
    	for (var i = 1; i < this._requests.length; ++i) {
    		var newNode = this._createNode(this._requests[i]);
    	    var parent = this._findParent(this._tree, newNode);
    	    if(parent !== null) {
            	parent.children.push(newNode);
            }
            else {
            	console.log("Orphan node: " + JSON.stringify(newNode));
            }

        }

		// return object rather than array
        return this._tree[0]; 
    },

   /**
     * @param {WebInspector.DependencyTree} tree
     * @param {WebInspector.DependencyTreeNode} node
     * @return {WebInspector.DependencyTreeNode}
     */
    _findParent: function(tree, node)
    {
    	var parent = null;

		for(var i = 0; i < tree.length && parent === null; i++) {
			if(tree[i].url === node.parent) {
				parent = tree[i];
			}
			else if(tree[i].children !== null) {
				parent = this._findParent(tree[i].children, node);
			}
    	}

    	return parent;
    },

   /**
     * @param {WebInspector.NetworkRequest} request
     * @return {Object}
     */
    _createNode: function(request)
    {
        return (new WebInspector.DependencyTreeNode(request)).build();
    },
}

/**
 * @constructor
 * @param {Array.<WebInspector.NetworkRequest>} requests
 */
WebInspector.DependencyChart = function(requests)
{
    this._dependencyTree = new WebInspector.DependencyTree(requests).build();		;
}

WebInspector.DependencyChart.prototype = {

	/*
	 * AD-FIXME: Should reallu produce a finished HTML page
	 */
	render : function() 
	{
        var w = window.open();
        w.document.writeln(JSON.stringify(this._dependencyTree));
	},
}
