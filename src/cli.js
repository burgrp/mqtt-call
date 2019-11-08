#!/usr/bin/env node

const mqttMtl = require("@device.farm/mqtt-mtl");
const client = require("./index.js").client;

let brokerAddress = process.env.MQTT;

if (!brokerAddress || process.argv.some(a => a === "-h" || a === "--help") || process.argv.length !== 5) {
    console.info(
        `use:

mqc <serverName> <serviceName> <paramsObject>

<paramsObject> must be JSON encoded string

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

    server[serviceName](JSON.parse(params))
        .then(result => {
            console.info(JSON.stringify(result, null, 2));
            process.exit(0);
        })
        .catch(e => {
            console.error(e);
            process.exit(1);
        });

}
