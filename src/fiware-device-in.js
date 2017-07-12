var Client = require('node-rest-client').Client;

var query = function(node) {
    if (node.fw_server) {
        // set content-type header and data as json in args parameter
        var args = {
            headers: {
                "Accept": "application/json",
                "X-Auth-Token": node.fw_server.fw_token
            }
        };

        var uri = node.fw_server.fw_protocol+'://'+node.fw_server.fw_host+":"+node.fw_server.fw_port;
        node.fiwareClient.get(uri + '/v2/entities/' + node.fw_id, args, function (data, response) {
            node.status({fill:"green",shape:"dot",text:node.fw_type + " received"});
	    console.log("fiware-device-in: received " + JSON.stringify(data));
	    try {
		var msg = { payload: data };
		node.send(msg);
	    } catch (e) {
		console.log("fiware-device-in: Error " + e);
	    }
        }).on('error', function (err) {
            node.status({fill:"red",shape:"dot",text:"error while requesting data"});
        });
    } else {
        node.status({fill:"yellow",shape:"dot",text:"not configured"});
    }
};

module.exports = function(RED) {
    function FiwareDeviceInNode(config) {
        var listener = 0;
        var node = this;
        RED.nodes.createNode(node, config);
        node.fw_server = RED.nodes.getNode(config.fw_server);
        node.fw_id = config.fw_id;
        node.fw_type = config.fw_type;
        node.fw_interval = config.fw_interval;

        node.fiwareClient = new Client();
        // handling client error events
        node.fiwareClient.on('error', function (err) {
            console.error('Something went wrong on the client', err);
        });

        listener = setInterval(query, node.fw_interval, node);
        node.on('close', function(done) {
            if (listener !== 0)
                clearInterval(listener);
            //doSomethingWithACallback(function() {
                done();
            //});
        });
    }
    RED.nodes.registerType("fiware-device-in",FiwareDeviceInNode);
};
