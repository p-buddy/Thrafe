(function () {
    'use strict';

    var __awaiter$1 = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    var __generator$1 = (undefined && undefined.__generator) || function (thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    };
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
        var _a, _b, _c;
        (_a = context.onmessage) !== null && _a !== void 0 ? _a : (context.onmessage = messageHandler);
        while (responseHandlers.length <= event)
            responseHandlers.push(undefined);
        var arr = responseHandlers[event];
        if (!arr) {
            responseHandlers[event] = [handler];
            return 0;
        }
        var free = freeResponseIDs.length < event ? undefined : freeResponseIDs[event];
        if (!free || free.length === 0) {
            console.log(arr.length);
            return (((_b = arr === null || arr === void 0 ? void 0 : arr.push(handler)) !== null && _b !== void 0 ? _b : 0) - 1);
        }
        var id = (_c = free === null || free === void 0 ? void 0 : free.pop()) !== null && _c !== void 0 ? _c : -1;
        arr[id] = handler;
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
    var objectIdentifier = "object";
    var functionIdentifier = "function";
    var isPromise = function (returnValue) {
        return typeof returnValue === objectIdentifier && typeof (returnValue === null || returnValue === void 0 ? void 0 : returnValue.then) === functionIdentifier;
    };
    var messageHandler = function (ev) { return __awaiter$1(void 0, void 0, void 0, function () {
        var _a, event, payload, responseID, isResponse, messageType, index, result;
        var _b, _c;
        return __generator$1(this, function (_d) {
            _a = ev.data, event = _a.event, payload = _a.payload, responseID = _a.responseID, isResponse = _a.isResponse;
            messageType = responseID !== undefined ? isResponse ? 2 /* Response */ : 1 /* Call */ : 0 /* OneWay */;
            switch (messageType) {
                case 0 /* OneWay */:
                    for (index = 0; index < ((_c = (_b = messageHandlers[event]) === null || _b === void 0 ? void 0 : _b.length) !== null && _c !== void 0 ? _c : 0); index++)
                        messageHandlers[event][index](payload);
                    return [2 /*return*/];
                case 1 /* Call */:
                    result = messageHandlers[event][0](payload);
                    return [2 /*return*/, isPromise(result)
                            ? result.then(function (resolved) { return postMessage({ event: event, payload: resolved, responseID: responseID, isResponse: true }); })
                            : postMessage({ event: event, payload: result, responseID: responseID, isResponse: true })];
                case 2 /* Response */:
                    return [2 /*return*/, returnResponseID(responseHandlers[event][responseID](payload), event)];
            }
            return [2 /*return*/];
        });
    }); };

    (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    (undefined && undefined.__generator) || function (thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
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

    var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    var __generator = (undefined && undefined.__generator) || function (thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    };
    handle(self, 1 /* GetSquare */, function (value) { return __awaiter(void 0, void 0, void 0, function () {
        var waitTime;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    waitTime = Math.random() * 1000 + 1000;
                    console.log("Waiting ".concat(waitTime / 1000, "s to compute square of ").concat(value));
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, waitTime); })];
                case 1:
                    _a.sent();
                    return [2 /*return*/, value * value];
            }
        });
    }); });
    handle(self, 0 /* SayHi */, function (name) {
        console.log(name);
        dispatch(self, 0 /* dummy */, -1);
    });
    dispatch(self, 0 /* dummy */, 666);

})();
