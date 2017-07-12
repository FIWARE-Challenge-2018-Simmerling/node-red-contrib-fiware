/**
 * Copyright Ell-i open source co-operative 2017
 *
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

module.exports = function(RED) {
    "use strict";
    function FiwareDeviceTypeNode(options) {
	const node = this;
	RED.nodes.createNode(node, options);

	node.type_name  = options.type_name;
	node.attributes = options.attributes;

	node.on('input', function(msg) {
	    // Do nothing
	});
    };

    RED.nodes.registerType("fiware-device-type", FiwareDeviceTypeNode);
}
