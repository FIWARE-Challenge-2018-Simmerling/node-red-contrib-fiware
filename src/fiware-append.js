module.exports = function(RED) {
    "use strict";

    const fetch = require('node-fetch');

    const DefaultFetchHeaders = {
        'User-Agent': 'fetch',
        'Content-Type': 'application/json',
    };

    const pre  = '{ "actionType": "append", "entities":';
    const post = '}';

    function _createFiwareAppendMessage(node, msg) {
	return pre + JSON.stringify(msg.payload) + post;
    }

    function FiwareAppendNode(options) {
        const node = this;
        RED.nodes.createNode(node, options);

        node.fw_server = RED.nodes.getNode(options.fw_server);
        node.fw_name   = options.fw_name;

	function _makeHeaders(headers) {
	    return Object.assign(
		{},
		DefaultFetchHeaders,
		headers,
		{ "X-Auth-Token": node.fw_server.fw_token }
	    );
	}

	async function _request(uri, method, headers, body) {
	    try {
		// XXX refactor
		const base_uri = node.fw_server.fw_protocol + '://'
		      + node.fw_server.fw_host + ":" + node.fw_server.fw_port;

		console.log("fiware-append: " + method + ": " + body);

		const res = await fetch(
		    base_uri + uri,
		    {
			method: method,
			body: body,
			headers: headers,
		    }
		);
                node.status({fill:"green", shape:"dot", text:node.fw_name + " sent"});
		return res;
	    } catch (e) {
                node.status({fill:"red",shape:"dot",text:"error while sending data:" + e});
	    }
	}

	function _request_append(msg) {
	    const headers = _makeHeaders(node.headers);
	    const body = _createFiwareAppendMessage(node, msg);
	    return _request('/v2/op/update', 'POST', headers, body);
	}

        node.on('input', function(msg) {
            if (!node.fw_server) {
                node.status({fill:"yellow", shape:"dot", text:"not configured"});
		return;
	    }
	    _request_append(msg);
        });

        node.on('close', function(done) {
            done();
        });
    }
    RED.nodes.registerType("fiware-append",FiwareAppendNode);
};
