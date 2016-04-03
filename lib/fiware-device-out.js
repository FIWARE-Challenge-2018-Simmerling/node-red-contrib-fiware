var Client = require('node-rest-client').Client;

var createFiWareMessage = function(node, msg) {
    var fwm =
    {
        "contextElements":[
            {
                "type":node.fw_type,
                "isPattern":"false",
                "id":node.fw_id,
                "attributes":[
                    {
                        "name":node.fw_name,
                        "type":node.fw_type,
                        "value":msg.payload
                    }
                ]
            }
        ],
        "updateAction":"APPEND"
    };
    return fwm;
};

module.exports = function(RED) {
    function FiwareDeviceOutNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        node.fw_server = RED.nodes.getNode(config.fw_server);
        node.fw_id = config.fw_id;
        node.fw_name = config.fw_name;
        node.fw_type = config.fw_type;

        node.fiwareClient = new Client();
        // handling client error events
        node.fiwareClient.on('error', function (err) {
            console.error('Something went wrong on the client', err);
        });

        node.on('input', function(msg) {
            if (node.fw_server) {
                // set content-type header and data as json in args parameter
                var fwm = createFiWareMessage(node, msg);
                var args = {
                    data: fwm,
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/json",
                        "X-Auth-Token": node.fw_server.fw_token
                    }
                };

                var uri = node.fw_server.fw_protocol+'://'+node.fw_server.fw_host+":"+node.fw_server.fw_port;
                node.fiwareClient.post(uri + '/v1/updateContext', args, function (data, response) {
                    node.status({fill:"green",shape:"dot",text:node.fw_type + " sent"});
                }).on('error', function (err) {
                    node.status({fill:"red",shape:"dot",text:"error while sending data"});
                });
            } else {
                node.status({fill:"yellow",shape:"dot",text:"not configured"});
            }
        });
        node.on('close', function(done) {
            //doSomethingWithACallback(function() {
                done();
            //});
        });
    }
    RED.nodes.registerType("fiware-device-out",FiwareDeviceOutNode);
};