(function () {
    'use strict';

    var messageHandlers = [[]];
    var responseHandlers = [[]];
    var freeResponseIDs = [[]];
    var handle = function (context, event, handler) {
        var _a;
        if (context.onmessage === null) {
            context.onmessage = messageHandler;
        }
        while (messageHandlers.length <= event) {
            messageHandlers.push(undefined);
        }
        if (messageHandlers[event] === undefined) {
            messageHandlers[event] = [handler];
        }
        else {
            (_a = messageHandlers[event]) === null || _a === void 0 ? void 0 : _a.push(handler);
        }
    };
    var addResponseHandler = function (context, event, handler) {
        var _a, _b, _c, _d, _e;
        if (context.onmessage === null) {
            context.onmessage = messageHandler;
        }
        while (responseHandlers.length <= event) {
            responseHandlers.push(undefined);
        }
        if (responseHandlers[event] === undefined) {
            responseHandlers[event] = [handler];
            return 0;
        }
        if (freeResponseIDs.length > event && ((_b = (_a = freeResponseIDs[event]) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0) > 0) {
            var id = freeResponseIDs[event].pop();
            responseHandlers[event][id] = handler;
            return id;
        }
        (_c = responseHandlers[event]) === null || _c === void 0 ? void 0 : _c.push(handler);
        return (_e = (_d = responseHandlers[event]) === null || _d === void 0 ? void 0 : _d.length) !== null && _e !== void 0 ? _e : -1;
    };
    var validate = function (msgType, event) {
        var _a, _b, _c;
        switch (msgType) {
            case 0 /* OneWay */:
            case 1 /* Call */:
                if (messageHandlers.length > event && ((_b = (_a = messageHandlers[event]) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0) > 0)
                    break;
                throw new Error("No handler has been added to handle event (#".concat(event, ")"));
            case 2 /* Response */:
                if (responseHandlers.length > event && ((_c = responseHandlers[event]) === null || _c === void 0 ? void 0 : _c.length))
                    break;
                throw new Error("No responder has been added to handle event (#".concat(event, "). This is likely an internal error."));
        }
    };
    var returnResponseID = function (id, event) {
        var _a, _b, _c;
        while (freeResponseIDs.length <= event) {
            freeResponseIDs.push(undefined);
        }
        if (freeResponseIDs[event] === undefined) {
            freeResponseIDs[event] = [id];
            return;
        }
        (_a = freeResponseIDs[event]) === null || _a === void 0 ? void 0 : _a.push(id);
        if (((_b = freeResponseIDs[event]) === null || _b === void 0 ? void 0 : _b.length) === ((_c = responseHandlers[event]) === null || _c === void 0 ? void 0 : _c.length)) {
            freeResponseIDs[event] = undefined;
        }
    };
    var messageHandler = function (ev) {
        var _a, _b;
        var _c = ev.data, event = _c.event, payload = _c.payload, responseID = _c.responseID, isResponse = _c.isResponse;
        var messageType = responseID !== undefined
            ? isResponse
                ? 2 /* Response */
                : 1 /* Call */
            : 0 /* OneWay */;
        validate(messageType, event);
        switch (messageType) {
            case 0 /* OneWay */:
                var length_1 = (_b = (_a = messageHandlers[event]) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0;
                for (var index = 0; index < length_1; index++) {
                    messageHandlers[event][index](payload);
                }
                return;
            case 1 /* Call */:
                var result = messageHandlers[event][0](payload);
                postMessage({ event: event, payload: result, responseID: responseID, isResponse: true });
                return;
            case 2 /* Response */:
                responseHandlers[event][responseID](payload);
                returnResponseID(responseID, event);
                return;
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
