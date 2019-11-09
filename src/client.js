const uuid = require("uuid");

module.exports = (mqttMtl, server) => {

    const clientId = uuid();
    let lastRequestId = 0;

    let pending = {}

    mqttMtl.subscribe(`call/response/${clientId}`, (topic, message) => {

        try {
            message = JSON.parse(message);
        } catch (e) {
            // discard invalid messages
            return;
        }

        let request = pending[message.request];

        if (request) {
            try {

                delete pending[message.request];
                clearTimeout(request.timeout);

                if (message.error) {
                    let e = new Error();
                    Object.assign(e, message.error);
                    throw e;
                } else {
                    request.resolve(message.result);
                }

            } catch (e) {
                request.reject(e);
            }
        }
    });

    return new Proxy({}, {
        get(target, service, receiver) {
            return (params, timeoutMs = 10000) => {
                let requestId = lastRequestId++;
                mqttMtl.publish(`call/request/${server}`, JSON.stringify({
                    client: {
                        id: clientId,
                        request: requestId
                    },
                    service,
                    params,
                }));
                return new Promise((resolve, reject) => {

                    let timeout = setTimeout(() => {
                        delete pending[requestId];
                        reject(new Error("Timeout"));
                    }, timeoutMs);

                    pending[requestId] = { resolve, reject, timeout };
                });
            }
        }
    });

}