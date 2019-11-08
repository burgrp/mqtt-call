const uuid = require("uuid");

module.exports = (mqttMtl, server) => {

    const clientId = uuid();
    let lastRequestId = 0;

    let pending = {}

    mqttMtl.subscribe(`call/response/${clientId}/+`, (topic, message) => {
        let topicItems = topic.split("/");
        if (topicItems.length === 4 && topicItems[0] === "call" && topicItems[1] === "response" && topicItems[2] === clientId) {
            let requestId = topicItems[3];
            let request = pending[requestId];

            if (request) {
                try {

                    delete pending[requestId];
                    clearTimeout(request.timeout);
                    response = JSON.parse(message.toString());

                    if (response.error) {
                        let e = new Error();
                        Object.assign(e, response.error);
                        throw e;
                    } else {
                        request.resolve(response.result);
                    }

                } catch (e) {
                    request.reject(e);
                }
            }
        }
    });

    return new Proxy({}, {
        get(target, service, receiver) {
            return (params, timeoutMs = 10000) => {
                let requestId = lastRequestId++;
                mqttMtl.publish(`call/request/${server}/${service}/${clientId}/${requestId}`, params === undefined || params === null? "": JSON.stringify(params));
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