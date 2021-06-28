
const { v4: uuidv4 } = require('uuid');
// const fs = require('fs');
const traceMap = new Map()

const asyncHooks = require('async_hooks')

const asyncHooksInstance = asyncHooks.createHook({ init, destroy })
asyncHooksInstance.enable()

function init (asyncId, type, triggerAsyncId, resource) {
    if (traceMap.has(triggerAsyncId)) {
        traceMap.set(asyncId, traceMap.get(triggerAsyncId))
    }
}

function destroy (asyncId) {
    if (traceMap.has(asyncId)) {
        traceMap.delete(asyncId)
    }
}

module.exports.createTraceContext = function (event, traceId = uuidv4()) {
    const traceData = {traceId, events: [event]}
    traceMap.set(asyncHooks.executionAsyncId(), traceData)
    return traceData
}

module.exports.getTraceContext = function () {
    return traceMap.get(asyncHooks.executionAsyncId())
}

module.exports.getTraceContextEventById = function (eventId, asyncId) {
    const trace = traceMap.get(asyncId ? asyncId : asyncHooks.executionAsyncId())

    if (trace) {
        return trace.events.find(event => event.id === eventId)
    }
}

module.exports.setEventToTrace = function (event, asyncId) {
    const trace = traceMap.get(asyncId ? asyncId : asyncHooks.executionAsyncId())
    if (trace) {
        const eventIndex = trace.events.findIndex((currEvent) => currEvent.id === event.id);
        if (eventIndex > -1) {
            trace.events[eventIndex] = event;
        } else {
            trace.events.push(event);
        }
    }
}