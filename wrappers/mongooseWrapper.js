const shimmer = require('shimmer');
const { v4: uuidv4 } = require('uuid');
const { getTraceContextEventById, setEventToTrace } = require('../traceContext');

function execWrapper(wrappedFunction) {
    return function internalMongooseWrapper() {
        const eventId = uuidv4();
        let mongooseEvent = {
            id: eventId,
            framework: 'mongoose',
            operation: this.op,
            collection: this.mongooseCollection.name,
            query: this.getFilter(),
            startTime: Date.now(),
        };
        setEventToTrace(mongooseEvent)
        const promiseResponse = wrappedFunction.apply(this, arguments)
        promiseResponse.then((error, response) => {
            const event = getTraceContextEventById(eventId)
            setEventToTrace({...event, endTime: Date.now()});
        })
        return promiseResponse
    };
}

module.exports.patchMongoose = (mongoose) => {
    shimmer.wrap(mongoose.Query.prototype, 'exec', execWrapper)
}
