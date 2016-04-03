module.exports = function(RED) {
    // This function is used to create a FiWare instance reference
    function FiwareInstanceNode(config) {
        // step 1: create the node to be used at node-red
        RED.nodes.createNode(this, config);
        // step 2: set the configuration for the node
        this.fw_protocol = config.fw_protocol; // the protocol (usually http or https)
        this.fw_host = config.fw_host; // the hostname
        this.fw_port = config.fw_port; // the port (usually 80 or 443)
        this.fw_token = config.fw_token; // the auth token
    }
    // step 1: register fiware-instance as a type in node-red
    //         using the FiwareInstanceNode as the constructor
    RED.nodes.registerType("fiware-instance", FiwareInstanceNode);
};