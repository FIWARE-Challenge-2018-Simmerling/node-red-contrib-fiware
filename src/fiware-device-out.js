module.exports = function(RED) {
    "use strict";

    const fetch = require('node-fetch');

    const DefaultFetchHeaders = {
        "Accept": "application/json",
        'User-Agent': 'fetch',
        'Content-Type': 'application/json',
    };

    function _createFiwareCreateMessage(node) {
	/* Initial message */
	const initial_msg = {
	    id:   node.fw_id,
	    type: node.fw_type.type_name,
	};

	return JSON.stringify(
	    node.fw_type.attributes.reduce(
		function (msg, attr) {
		    msg[attr.name] = { value: null, type: attr.type };
		    return msg;
		},
		initial_msg
	    )
	);
    }

    function _createFiwareModifyMessage(node, msg) {
	return JSON.stringify(msg.payload);
    }

    function FiwareDeviceOutNode(options) {
        const node = this;
        RED.nodes.createNode(node, options);

        node.fw_server = RED.nodes.getNode(options.fw_server);
        node.fw_name   = options.fw_name;
	node.fw_id     = options.fw_id;
	node.fw_type   = RED.nodes.getNode(options.fw_type);

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

		console.log("fiware-device-out: " + method + ": " + body);

		const res = await fetch(
		    base_uri + uri,
		    {
			method: method,
			body: body,
			headers: headers,
		    }
		);
                node.status({fill:"green", shape:"dot", text:node.fw_type.name + " sent"});
		return res;
	    } catch (e) {
                node.status({fill:"red",shape:"dot",text:"error while sending data:" + e});
	    }
	}

	function _request_create(msg) {
	    const headers = _makeHeaders(node.headers);
	    const body = _createFiwareCreateMessage(node, msg);
	    return _request('/v2/entities', 'POST', headers, body);
	}

	function _request_update(msg) {
	    const headers = _makeHeaders(node.headers);
	    const body = _createFiwareModifyMessage(node, msg);
	    return _request('/v2/entities/' + node.fw_id + "/attrs", 'PATCH', headers, body);
	}

        node.on('input', function(msg) {
            if (!node.fw_server) {
                node.status({fill:"yellow", shape:"dot", text:"not configured"});
		return;
	    }
	    _request_update(msg);
        });

        node.on('close', function(done) {
            done();
        });

	/* Create a corresponding node in FIWARE */
	_request_create(node);
    }
    RED.nodes.registerType("fiware-device-out",FiwareDeviceOutNode);
};
