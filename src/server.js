module.exports = (mqttMtl, name, handler) => {

    mqttMtl.subscribe(`call/request/${name}`, async (topic, message) => {

        try {
            message = JSON.parse(message);
        } catch (e) {
            // discard invalid messages
            return;
        }

        function send(etc) {
            mqttMtl.publish(`call/response/${message.client.id}`, JSON.stringify({
                request: message.client.request,
                ...etc
            }));
        }

        try {
            if (!handler.propertyIsEnumerable(message.service) || typeof handler[message.service] !== 'function') {
                throw new Error(`Unknown service "${message.service}"`);
            }
            let result = await handler[message.service](message.params);
            send({ result });
        } catch (error) {
            send({ error: Object.getOwnPropertyNames(error).filter(n => n !== "stack").reduce((acc, v) => ({ [v]: error[v], ...acc }), {}) });
        }

    });

}