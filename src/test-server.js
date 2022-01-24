const mqttMtl_ = require("@burgrp/mqtt-mtl");

require("./index.js").server(mqttMtl_(`mqtt://${process.env.MQTT}`), "test", {
    add({a, b}) {
        return a + b;
    },
    sub({a, b}) {
        return a - b;
    }
});