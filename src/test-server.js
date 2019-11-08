const mqttMtl_ = require("@device.farm/mqtt-mtl");

require("./index.js").server(mqttMtl_("mqtt://127.0.0.1"), "test", {
    add({a, b}) {
        return a + b;
    },
    sub({a, b}) {
        return a - b;
    }
});