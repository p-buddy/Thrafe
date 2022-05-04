(function () {
    'use strict';

    var messageHandlers = [[]];
    var responseHandlers = [[]];
    var freeResponseIDs = [[]];
    var handle = function (context, event, handler) {
        var _a, _b, _c;
        (_a = context.onmessage) !== null && _a !== void 0 ? _a : (context.onmessage = messageHandler);
        while (messageHandlers.length <= event)
            messageHandlers.push(undefined);
        (_c = (_b = messageHandlers[event]) === null || _b === void 0 ? void 0 : _b.push(handler)) !== null && _c !== void 0 ? _c : (messageHandlers[event] = [handler]);
    };
    var addResponseHandler = function (context, event, handler) {
        var _a, _b, _c, _d, _e, _f, _g;
        (_a = context.onmessage) !== null && _a !== void 0 ? _a : (context.onmessage = messageHandler);
        while (responseHandlers.length <= event)
            responseHandlers.push(undefined);
        (_b = responseHandlers[event]) !== null && _b !== void 0 ? _b : (responseHandlers[event] = [handler]);
        if (((_c = responseHandlers[event]) === null || _c === void 0 ? void 0 : _c.length) === 1)
            return 0;
        if (freeResponseIDs.length < event || !freeResponseIDs[event])
            return ((_e = (_d = responseHandlers[event]) === null || _d === void 0 ? void 0 : _d.push(handler)) !== null && _e !== void 0 ? _e : 0) - 1;
        var id = (_g = (_f = freeResponseIDs[event]) === null || _f === void 0 ? void 0 : _f.pop()) !== null && _g !== void 0 ? _g : -1;
        responseHandlers[event][id] = handler;
        return id;
    };
    var returnResponseID = function (id, event) {
        var _a, _b, _c, _d;
        while (freeResponseIDs.length <= event)
            freeResponseIDs.push(undefined);
        (_b = (_a = freeResponseIDs[event]) === null || _a === void 0 ? void 0 : _a.push(id)) !== null && _b !== void 0 ? _b : (freeResponseIDs[event] = [id]);
        if (((_c = freeResponseIDs[event]) === null || _c === void 0 ? void 0 : _c.length) === ((_d = responseHandlers[event]) === null || _d === void 0 ? void 0 : _d.length))
            freeResponseIDs[event] = undefined;
    };
    var messageHandler = function (ev) {
        var _a, _b;
        var _c = ev.data, event = _c.event, payload = _c.payload, responseID = _c.responseID, isResponse = _c.isResponse;
        var messageType = responseID !== undefined ? isResponse ? 2 /* Response */ : 1 /* Call */ : 0 /* OneWay */;
        switch (messageType) {
            case 0 /* OneWay */:
                for (var index = 0; index < ((_b = (_a = messageHandlers[event]) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0); index++)
                    messageHandlers[event][index](payload);
                return;
            case 1 /* Call */:
                return postMessage({ event: event, payload: messageHandlers[event][0](payload), responseID: responseID, isResponse: true });
            case 2 /* Response */:
                return returnResponseID(responseHandlers[event][responseID](payload), event);
        }
    };

    var dispatch = function (context, event, payload) {
        var onResponse = [];
        for (var _i = 3; _i < arguments.length; _i++) {
            onResponse[_i - 3] = arguments[_i];
        }
        onResponse.length > 0
            ? context.postMessage({ event: event, payload: payload, responseID: addResponseHandler(context, event, onResponse[0]) })
            : context.postMessage({ event: event, payload: payload });
    };

    handle(self, 1 /* GetSquare */, function (value) {
        return value * value;
    });
    handle(self, 0 /* SayHi */, function (name) {
        console.log(name);
        dispatch(self, 0 /* dummy */, -1);
    });
    dispatch(self, 0 /* dummy */, 666);

})();
