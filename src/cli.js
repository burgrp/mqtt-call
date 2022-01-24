#!/usr/bin/env node

const mqttMtl = require("@burgrp/mqtt-mtl");
const client = require("./index.js").client;
const fs = require("fs");

let brokerAddress = process.env.MQTT;

if (!brokerAddress || process.argv.some(a => a === "-h" || a === "--help") || process.argv.length !== 5) {
    console.info(
        `use:

mqc <serverName> <serviceName> <paramsObject>

<paramsObject> must be JSON encoded string or "-" to read JSON params from stdin

the tool expects MQTT environment variable to point to MQTT broker
`
    );
} else {
    [
        nodePath,
        scriptPath,
        serverName,
        serviceName,
        params
    ] = process.argv;

    let server = client(mqttMtl(`mqtt://${brokerAddress}`), serverName);

    if (params === "-") {        
        params = fs.readFileSync(0, 'utf-8');
    }

    server[serviceName](JSON.parse(params))
        .then(result => {
            console.info(JSON.stringify(result, null, 2));
            process.exit(0);
        })
        .catch(e => {
            console.error(e.message && `Error: ${e.message}` || e);
            process.exit(1);
        });

}
