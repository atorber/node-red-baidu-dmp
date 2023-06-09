
module.exports = function(RED) {
    "use strict";
    var Mock = require('mockjs');

    function MockNode(n) {
        RED.nodes.createNode(this,n);
        this.field = n.field || "payload";
        this.template = n.template;
        this.fieldType = n.fieldType || "msg";
        // this.optionField = n.optionField || "MBOption";
        // this.optionFieldType = n.optionFieldType || "flow";
        this.syntax = n.syntax || "json";
        var node = this;
        node.on("input", function(msg) {
            try {
                if(node.syntax === "text") {
                   try{
                    var value = Mock.mock(node.template);
                     }
                    catch(e) { node.error(RED._("mocknode.errors.json-error")); }
                }else if (node.syntax === "json") {
                    try { 
                        var value = Mock.mock(JSON.parse(node.template));
                        // value = JSON.parse(value); 
                    }catch(e) { 
                        node.error(RED._("mocknode.errors.json-error")); 
                    }
                }

                if (node.fieldType === 'msg') {
                    RED.util.setMessageProperty(msg,node.field,value);
                } else if (node.fieldType === 'flow') {
                    node.context().flow.set(node.field,value);
                } else if (node.fieldType === 'global') {
                    node.context().global.set(node.field,value);
                }
                node.send(msg);
            } catch(err) {
                node.error(err.message);
            }
        });
    }
    RED.nodes.registerType("mock node",MockNode);
    RED.library.register("mock node");
}
