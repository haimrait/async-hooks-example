const shimmer = require('shimmer');
const { v4: uuidv4 } = require('uuid');
const { getTraceContextEventById, setEventToTrace } = require('../traceContext');

function getWrapper(wrappedFunction) {
    return function internalGetWrapper() {
        const [key] = arguments;
        console.log(this);
        const eventId = uuidv4();
        let redisEvent = {
            id: eventId,
            framework: 'redis',
            command: 'get',
            key,
            startTime: Date.now(),
        };
        setEventToTrace(redisEvent)

        const promiseResponse = wrappedFunction.apply(this, arguments);
        promiseResponse.then(() => {
            const event = getTraceContextEventById(eventId);
            setEventToTrace({...event, endTime: Date.now()});
        });
        return promiseResponse;
    };
}

function setWrapper(wrappedFunction) {
    return function internalSetWrapper() {
        const [key, value, op, ttl] = arguments;
        const eventId = uuidv4();
        let redisEvent = {
            id: eventId,
            framework: 'redis',
            metadata: {
                key,
                value,
                ttl,
                op
            },
            command: 'set',
            startTime: Date.now(),
        };
        setEventToTrace(redisEvent)
        const promiseResponse = wrappedFunction.apply(this, arguments);
        promiseResponse.then(() => {
            const event = getTraceContextEventById(eventId);
            setEventToTrace({...event, endTime: Date.now()});
        });
        return promiseResponse;
    };
}



module.exports.patchRedis = (redis) => {
    shimmer.wrap(redis, 'getAsync', getWrapper)
    shimmer.wrap(redis, 'setAsync', setWrapper)
}