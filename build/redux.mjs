/******/ var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports["default"] = createStore;
var typings_1 = __webpack_require__(2);
/** createStore 函数 用来创建store对象 */
function createStore(reducer, enhancer) {
    /** 判断enhancer是否传入，如果传入则传入createStore reducer等*/
    if (typeof enhancer !== "undefined") {
        if (typeof enhancer !== "function") {
            throw new Error("enhancer参数需要传入一个函数！");
        }
        return enhancer(createStore)(reducer);
    }
    /** 当前的状态 初始化为null */
    var currentState = null;
    /** 当前的reducer函数 初始化为reducer入参 */
    var currentReducer = reducer;
    /** 当前listener Map  */
    var currentListeners = new Map();
    /** next listener Mao */
    var nextListeners = currentListeners;
    /** listener 计数器 用来作为Map的key */
    var listenerCnt = 0;
    /** reducer 锁，表示正在执行reducer，reducer要求是纯函数，
     * 1. 不能在reducer中调用dispatch等2050
     * 2. 不能在reduer中读取获得state  reducer的state只能从入参获得
     * 这是为了保证reducer的原子性 使用getState会绕过快照机制，不能保证确定的state和确定的action返回确定的结果
     * */
    var isDispatching = false;
    /** 保证能够修改 nextListeners Map对象
     *  redux采用双缓冲策略 使用 nextListeners 存储最新的listener currentListener存储旧的listener
     *  当subscirbe的时候 只修改nextListener
     *  当trigger的时候，同步nextListener 和 currentListener
     *  为了防止listener trigger的时候再次调用subscribe导致listener Map变大 在执行trigger之前，同步两个Map
     *  每次subscirbe的时候都会检查，如果两个Map相同，那么就创建一个Map快照赋给nextListeners ，然后操作nextListeners
     *  这样即便在triiger时subscribe 也不会影响当前遍历的map
     */
    function ensureCanMutatenextListeners() {
        if (nextListeners === currentListeners) {
            /** 创建快照 赋给nextListeners */
            nextListeners = new Map();
            currentListeners.forEach(function (listener, key) {
                nextListeners.set(key, listener);
            });
        }
    }
    /** 监听器中调用dispatch会导致死循环 */
    function dispatch(action) {
        /** 检查action合法性 */
        if (typeof action !== "object")
            throw new Error("dispatch错误: 请传入一个对象类型的Action");
        if (typeof action.type !== "string")
            throw new Error("dispatch错误: Action.type必须为string");
        if (isDispatching) {
            /** 如果isDispatching = true 表示当前正在运行reducer 此时为了保证reducer是纯函数 其内部
             * 1. 不能调用dispatch
             * 2. 不能调用getState获取state
             */
            throw new Error("dispatch错误: 无法在reducer函数内调用dispatch 请保证reducer为纯函数！");
        }
        /** 调用reducer */
        try {
            isDispatching = true;
            /** 调用reducer 获取新的state */
            currentState = currentReducer(currentState, action);
        }
        finally {
            isDispatching = false;
        }
        /** trigger listener */
        /** 同步nextListeners 和 currentListeners */
        var listener = (currentListeners = nextListeners);
        listener.forEach(function (listener) { return listener(); });
    }
    /** subscribe 函数 */
    function subscribe(listenerCallback) {
        if (typeof listenerCallback !== "function")
            throw new Error("subscribe错误: listenerCallback必须是函数类型！");
        /** 保证reducer是纯函数
         *  1. 在其中不能dispatch
         *  2. 不能注册listener
         *  3. 不能调用getState
         */
        if (isDispatching)
            throw new Error("subscribe\u9519\u8BEF: \u4E0D\u80FD\u5728reducer\u4E2D\u6CE8\u518Clistener \u8BF7\u4FDD\u8BC1reducer\u662F\u7EAF\u51FD\u6570");
        /** 开始注册，先检查当前双缓冲书否为同步状态，如果同步，创建快照 */
        ensureCanMutatenextListeners();
        var listenerId = listenerCnt++;
        nextListeners.set(listenerId, listenerCallback);
        /** 表示已经注册 */
        var isSubscribed = true;
        return function () {
            if (!isSubscribed)
                return; // 防止多次unsubcribe
            /** 保证在reducer中也不能 unsubcribe */
            if (isDispatching)
                throw new Error("unsubscribe\u9519\u8BEF: \u4E0D\u80FD\u5728reducer\u4E2D\u6CE8\u9500listener \u8BF7\u4FDD\u8BC1reducer\u662F\u7EAF\u51FD\u6570");
            isSubscribed = false;
            /** 删除前也需要先创建快照 */
            ensureCanMutatenextListeners();
            nextListeners.delete(listenerId);
            currentListeners = null; // current没用了 可以直接回收
        };
    }
    /** getState 在dispacth中 不能调用 */
    function getState() {
        if (isDispatching)
            throw new Error("无法在reducer中调用 getState 请保证reducer是纯函数");
        return currentState;
    }
    /** 更换reducer */
    function replaceReducer(reducer) {
        if (typeof reducer !== "function")
            throw new Error("reducer 必须是一个函数！");
        currentReducer = reducer;
        /** 重新dispatch 给state赋值 */
        dispatch({ type: typings_1.EActionType.REPLACE });
    }
    /** 初始化reducer 获得initialState */
    dispatch({ type: typings_1.EActionType.INIT });
    return {
        dispatch: dispatch,
        subscribe: subscribe,
        getState: getState,
        replaceReducer: replaceReducer,
    };
}


/***/ }),
/* 2 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.EActionType = void 0;
/** redux 内置action类型 */
var EActionType;
(function (EActionType) {
    /** 初始化Action */
    EActionType["INIT"] = "@@redux/INIT";
    /** 更换Reducer 之后初始化Action类型*/
    EActionType["REPLACE"] = "@@redux/REPLACE";
})(EActionType || (exports.EActionType = EActionType = {}));


/***/ }),
/* 3 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports["default"] = applyMiddleWare;
var compose_1 = __webpack_require__(4);
/** 应用中间件 */
function applyMiddleWare() {
    var middlewares = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        middlewares[_i] = arguments[_i];
    }
    return function (createStore) {
        return function (reducer) {
            var store = createStore(reducer);
            var dispatch = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                throw new Error("创建中间件的过程中 不能调用dispatch");
            };
            var middlewareApi = {
                /** 创建middleware的时候 不能调用dispatch */
                dispatch: function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    return dispatch.apply(void 0, args);
                },
                getState: store.getState,
            };
            var dispatchPatchChain = middlewares.map(function (middleware) {
                return middleware(middlewareApi);
            });
            dispatch = compose_1.default.apply(void 0, dispatchPatchChain)(store.dispatch);
            return __assign(__assign({}, store), { dispatch: dispatch });
        };
    };
}


/***/ }),
/* 4 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports["default"] = compose;
function compose() {
    var patchDispatch = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        patchDispatch[_i] = arguments[_i];
    }
    return function (dispatch) {
        return patchDispatch.reduce(function (currentDispatch, patchFn) {
            return patchFn(currentDispatch);
        }, dispatch);
    };
}


/***/ }),
/* 5 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports["default"] = combineReducers;
/** 结合reducer */
function combineReducers(reducerMap) {
    return function (state, action) {
        return Object.keys(reducerMap).reduce(function (newState, currentReducerKey) {
            newState[currentReducerKey] = reducerMap[currentReducerKey](state, action);
            return newState;
        }, {});
    };
}


/***/ })
/******/ ]);
/************************************************************************/
/******/ // The module cache
/******/ var __webpack_module_cache__ = {};
/******/ 
/******/ // The require function
/******/ function __webpack_require__(moduleId) {
/******/ 	// Check if module is in cache
/******/ 	var cachedModule = __webpack_module_cache__[moduleId];
/******/ 	if (cachedModule !== undefined) {
/******/ 		return cachedModule.exports;
/******/ 	}
/******/ 	// Create a new module (and put it into the cache)
/******/ 	var module = __webpack_module_cache__[moduleId] = {
/******/ 		// no module.id needed
/******/ 		// no module.loaded needed
/******/ 		exports: {}
/******/ 	};
/******/ 
/******/ 	// Execute the module function
/******/ 	__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 
/******/ 	// Return the exports of the module
/******/ 	return module.exports;
/******/ }
/******/ 
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.combineReducers = exports.applyMiddleware = exports.createStore = void 0;
var createStore_1 = __webpack_require__(1);
exports.createStore = createStore_1.default;
var applyMiddleware_1 = __webpack_require__(3);
exports.applyMiddleware = applyMiddleware_1.default;
var combineReducers_1 = __webpack_require__(5);
exports.combineReducers = combineReducers_1.default;

})();

var __webpack_exports___esModule = __webpack_exports__.__esModule;
var __webpack_exports__applyMiddleware = __webpack_exports__.applyMiddleware;
var __webpack_exports__combineReducers = __webpack_exports__.combineReducers;
var __webpack_exports__createStore = __webpack_exports__.createStore;
export { __webpack_exports___esModule as __esModule, __webpack_exports__applyMiddleware as applyMiddleware, __webpack_exports__combineReducers as combineReducers, __webpack_exports__createStore as createStore };
