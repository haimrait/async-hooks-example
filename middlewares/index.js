const { v4: uuidv4 } = require('uuid');
const { getTraceContextEventById, createTraceContext, setEventToTrace, getTraceContext } = require('../traceContext');

module.exports.addTraceContext = (req, res, next) => {
    const eventId = uuidv4();
    const expressEvent = {
        id: eventId,
        requestId: req.id,
        framework: 'express',
        method: req.method,
        hostname: req.hostname,
        startTime: Date.now(),
    };
    createTraceContext(expressEvent)

    res.once('finish', () => {
        const event = getTraceContextEventById(eventId)
        setEventToTrace({...event, endTime: Date.now()});
        console.log(`Send trace to the server: ${JSON.stringify(getTraceContext(), undefined, 2)}`)
    })
    next();
}


