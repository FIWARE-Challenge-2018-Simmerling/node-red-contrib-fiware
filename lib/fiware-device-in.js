var Client = require('node-rest-client').Client;

var createFiWareMessage = function(node) {
    var fwm = {
        "entities":
        [
            {
                "type": node.fw_type,
                "isPattern": "false",
                "id": node.fw_id
            }
        ]
    };
    return fwm;
};

var query = function(node) {
    if (node.fw_server) {
        // set content-type header and data as json in args parameter
        var fwm = createFiWareMessage(node);
        var args = {
            data: fwm,
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "X-Auth-Token": node.fw_server.fw_token
            }
        };

        var uri = node.fw_server.fw_protocol+'://'+node.fw_server.fw_host+":"+node.fw_server.fw_port;
        node.fiwareClient.post(uri + '/v1/queryContext', args, function (data, response) {
            node.status({fill:"green",shape:"dot",text:node.fw_type + " received"});
            var msg = { payload: data.contextResponses[0].contextElement.attributes[0].value };
            node.send(msg);
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

        listener = setInterval(query, 1000, node);
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