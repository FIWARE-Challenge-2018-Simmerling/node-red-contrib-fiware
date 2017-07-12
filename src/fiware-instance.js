module.exports = function(RED) {
    // This function is used to create a FiWare instance reference
    function FiwareInstanceNode(config) {
        // step 1: create the node to be used at node-red
        const node = this;
        RED.nodes.createNode(node, config);
        // step 2: set the configuration for the node
        node.fw_protocol = config.fw_protocol; // the protocol (usually http or https)
        node.fw_host     = config.fw_host; // the hostname
        node.fw_port     = config.fw_port; // the port (usually 80 or 443)
        node.fw_token    = config.fw_token; // the auth token
        node.on('input', function(msg) {});
    }
    // step 1: register fiware-instance as a type in node-red
    //         using the FiwareInstanceNode as the constructor
    RED.nodes.registerType("fiware-instance", FiwareInstanceNode);
};
