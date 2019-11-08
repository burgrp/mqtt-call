module.exports = (mqttMtl, name, handler) => {

    mqttMtl.subscribe(`call/request/${name}/#`, async (topic, message) => {
        let topicItems = topic.split("/");
        if (topicItems.length === 6 && topicItems[0] === "call" && topicItems[1] === "request" && topicItems[2] === name) {
            let service = topicItems[3];
            let clientId = topicItems[4];
            let requestId = topicItems[5];

            function send(data) {
                mqttMtl.publish(`call/response/${clientId}/${requestId}`, JSON.stringify(data));
            }

            try {
                if (typeof handler[service] !== 'function') {
                    throw new Error(`Unknown service "${service}"`);
                }
                let result = await handler[service](JSON.parse(message.toString()));
                send({ result });
            } catch (error) {
                send({ error: Object.getOwnPropertyNames(error).reduce((acc, v) => ({ [v]: error[v], ...acc }), {}) });
            }
        }
    });

}