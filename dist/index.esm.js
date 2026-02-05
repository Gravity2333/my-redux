/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ var __webpack_modules__ = ({

/***/ "./src/applyMiddleware.ts":
/*!********************************!*\
  !*** ./src/applyMiddleware.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   applyMiddleWare: () => (/* binding */ applyMiddleWare)\n/* harmony export */ });\n/* harmony import */ var _utils_compose__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils/compose */ \"./src/utils/compose.ts\");\n\n/** 应用中间件 */\nfunction applyMiddleWare(...middlewares) {\n    return (createStore) => (reducer) => {\n        const store = createStore(reducer);\n        let dispatch = (...args) => {\n            throw new Error(\"创建中间件的过程中 不能调用dispatch\");\n        };\n        const middlewareApi = {\n            /** 创建middleware的时候 不能调用dispatch */\n            dispatch: (...args) => dispatch(...args),\n            getState: store.getState,\n        };\n        const dispatchPatchChain = middlewares.map((middleware) => middleware(middlewareApi));\n        dispatch = (0,_utils_compose__WEBPACK_IMPORTED_MODULE_0__[\"default\"])(...dispatchPatchChain)(store.dispatch);\n        return {\n            ...store,\n            dispatch,\n        };\n    };\n}\n\n\n//# sourceURL=webpack://my-redux/./src/applyMiddleware.ts?");

/***/ }),

/***/ "./src/combineReducers.ts":
/*!********************************!*\
  !*** ./src/combineReducers.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   combineReducers: () => (/* binding */ combineReducers)\n/* harmony export */ });\n/** 结合reducer */\nfunction combineReducers(reducerMap) {\n    return (state, action) => {\n        return Object.keys(reducerMap).reduce((newState, currentReducerKey) => {\n            newState[currentReducerKey] = reducerMap[currentReducerKey](state, action);\n            return newState;\n        }, {});\n    };\n}\n\n\n//# sourceURL=webpack://my-redux/./src/combineReducers.ts?");

/***/ }),

/***/ "./src/createStore.ts":
/*!****************************!*\
  !*** ./src/createStore.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ createStore)\n/* harmony export */ });\n/* harmony import */ var _typings__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./typings */ \"./src/typings.ts\");\n\n/** createStore 函数 用来创建store对象 */\nfunction createStore(reducer, enhancer) {\n    /** 判断enhancer是否传入，如果传入则传入createStore reducer等*/\n    if (typeof enhancer !== \"undefined\") {\n        if (typeof enhancer !== \"function\") {\n            throw new Error(\"enhancer参数需要传入一个函数！\");\n        }\n        return enhancer(createStore)(reducer);\n    }\n    /** 当前的状态 初始化为null */\n    let currentState = null;\n    /** 当前的reducer函数 初始化为reducer入参 */\n    let currentReducer = reducer;\n    /** 当前listener Map  */\n    let currentListeners = new Map();\n    /** next listener Map */\n    let nextListeners = currentListeners;\n    /** listener 计数器 用来作为Map的key */\n    let listenerCnt = 0;\n    /** reducer 锁，表示正在执行reducer，reducer要求是纯函数，\n     * 1. 不能在reducer中调用dispatch等2050\n     * 2. 不能在reduer中读取获得state  reducer的state只能从入参获得\n     * 这是为了保证reducer的原子性 使用getState会绕过快照机制，不能保证确定的state和确定的action返回确定的结果\n     * */\n    let isDispatching = false;\n    /** 举个例子说明为什么需要双缓冲\n     *  1. 什么是双缓冲，就是在要修改listener的时候先拷贝一份出来，在这个拷贝的列表中修改\n     *  2. 在读取listener的时候 把currentListener 和 nextListener 合并 （用next代替current）\n     *\n     *  为什么要这么设计?\n     *  dispatch函数中，执行reducer的阶段 不能注册 卸载事件\n     *  但是在reducer之后之后，执行listener的阶段，没有这些限制\n     *  如果一个listener\n     *  const unlistener = store.listen(()=>{\n     *    unlistener() // 自杀\n     *  })\n     *\n     *  或者\n     *  store.listen(()=>{\n     *     store.listen(()=>{ // 注册其他的监听函数\n     *        console.log('inner listener')\n     *     })\n     *   })\n     *\n     *  会导致监听器执行混乱，需要保证执行的时候定死遍历列表，这就需要在需要修改listerList的时候，先拷贝一份新的出来！\n     */\n    /**\n     *  保证能够修改 nextListeners Map对象\n     *  redux采用双缓冲策略 使用 nextListeners 存储最新的listener currentListener存储旧的listener\n     *  当subscirbe的时候 只修改nextListener\n     *  当trigger的时候，同步nextListener 和 currentListener\n     *  为了防止listener trigger的时候再次调用subscribe导致listener Map变大 在执行trigger之前，同步两个Map\n     *  每次subscirbe的时候都会检查，如果两个Map相同，那么就创建一个Map快照赋给nextListeners ，然后操作nextListeners\n     *  这样即便在trigger时subscribe 也不会影响当前遍历的map\n     */\n    function ensureCanMutatenextListeners() {\n        if (nextListeners === currentListeners) {\n            /** 创建快照 赋给nextListeners */\n            nextListeners = new Map();\n            currentListeners.forEach((listener, key) => {\n                nextListeners.set(key, listener);\n            });\n        }\n    }\n    /** dispatch 函数执行的过程中 会调用reducer函数 要求\n     * reducer函数内 不能调用getState\n     * reducer函数内 不能调用dispatch 会死循环\n     * reducer函数内 不能注册/取消注册listener 会破坏纯函数\n     */\n    function dispatch(action) {\n        /** 检查action合法性 */\n        if (typeof action !== \"object\")\n            throw new Error(\"dispatch错误: 请传入一个对象类型的Action\");\n        if (typeof action.type !== \"string\")\n            throw new Error(\"dispatch错误: Action.type必须为string\");\n        if (isDispatching) {\n            /** 如果isDispatching = true 表示当前正在运行reducer 此时为了保证reducer是纯函数 其内部\n             * 1. 不能调用dispatch 可能导致死循环\n             * 2. 不能调用getState获取state\n             */\n            throw new Error(\"dispatch错误: 无法在reducer函数内调用dispatch 请保证reducer为纯函数！\");\n        }\n        /** 调用reducer */\n        try {\n            isDispatching = true;\n            /** 调用reducer 获取新的state */\n            currentState = currentReducer(currentState, action);\n        }\n        finally {\n            isDispatching = false;\n        }\n        /** trigger listener */\n        /** 同步nextListeners 和 currentListeners */\n        const listener = (currentListeners = nextListeners);\n        listener.forEach((listener) => listener());\n    }\n    /** subscribe 函数 */\n    function subscribe(listenerCallback) {\n        if (typeof listenerCallback !== \"function\")\n            throw new Error(\"subscribe错误: listenerCallback必须是函数类型！\");\n        /** 保证reducer是纯函数\n         *  1. 在其中不能dispatch\n         *  2. 不能注册listener\n         *  3. 不能调用getState\n         */\n        if (isDispatching)\n            throw new Error(`subscribe错误: 不能在reducer中注册listener 请保证reducer是纯函数`);\n        /** 开始注册，先检查当前双缓冲书否为同步状态，如果同步，创建快照\n         *  场景：在监听函数里“自杀” (Unsubscribe)\n         *  场景：在监听函数里“繁衍” (Subscribe)\n         */\n        ensureCanMutatenextListeners();\n        const listenerId = listenerCnt++;\n        nextListeners.set(listenerId, listenerCallback);\n        /** 表示已经注册\n         *  多次调用unsubscribe函数的时候 只能执行一次\n         */\n        let isSubscribed = true;\n        /** ub subscribe 函数 */\n        return () => {\n            if (!isSubscribed)\n                return; // 防止多次unsubcribe\n            /** 保证在reducer中也不能 unsubcribe */\n            if (isDispatching)\n                throw new Error(`unsubscribe错误: 不能在reducer中注销listener 请保证reducer是纯函数`);\n            isSubscribed = false;\n            /** 删除前也需要先创建快照 */\n            ensureCanMutatenextListeners();\n            nextListeners.delete(listenerId);\n            currentListeners = null; // current没用了 可以直接回收\n        };\n    }\n    /** getState 在dispacth中 不能调用\n     *  为什么在 reducer函数内不能调用getSate\n     *  因为要保证reducer是纯函数，其结果只有由state & action 决定\n     *  state相当于执行前传入的state快照\n     *  如果在reducer中修改了state，就会导致纯函数会破坏\n     */\n    function getState() {\n        if (isDispatching)\n            throw new Error(\"无法在reducer中调用 getState 请保证reducer是纯函数\");\n        return currentState;\n    }\n    /** 更换reducer */\n    function replaceReducer(reducer) {\n        if (typeof reducer !== \"function\")\n            throw new Error(\"reducer 必须是一个函数！\");\n        currentReducer = reducer;\n        /** 重新dispatch 给state赋值 */\n        dispatch({ type: _typings__WEBPACK_IMPORTED_MODULE_0__.EActionType.REPLACE });\n    }\n    /** 初始化reducer 获得initialState */\n    dispatch({ type: _typings__WEBPACK_IMPORTED_MODULE_0__.EActionType.INIT });\n    return {\n        dispatch,\n        subscribe,\n        getState,\n        replaceReducer,\n    };\n}\n\n\n//# sourceURL=webpack://my-redux/./src/createStore.ts?");

/***/ }),

/***/ "./src/index.ts":
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   EActionType: () => (/* reexport safe */ _typings__WEBPACK_IMPORTED_MODULE_3__.EActionType),\n/* harmony export */   applyMiddleWare: () => (/* reexport safe */ _applyMiddleware__WEBPACK_IMPORTED_MODULE_2__.applyMiddleWare),\n/* harmony export */   combineReducers: () => (/* reexport safe */ _combineReducers__WEBPACK_IMPORTED_MODULE_1__.combineReducers),\n/* harmony export */   createStore: () => (/* reexport safe */ _createStore__WEBPACK_IMPORTED_MODULE_0__[\"default\"])\n/* harmony export */ });\n/* harmony import */ var _createStore__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./createStore */ \"./src/createStore.ts\");\n/* harmony import */ var _combineReducers__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./combineReducers */ \"./src/combineReducers.ts\");\n/* harmony import */ var _applyMiddleware__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./applyMiddleware */ \"./src/applyMiddleware.ts\");\n/* harmony import */ var _typings__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./typings */ \"./src/typings.ts\");\n\n\n\n\n\n\n\n//# sourceURL=webpack://my-redux/./src/index.ts?");

/***/ }),

/***/ "./src/typings.ts":
/*!************************!*\
  !*** ./src/typings.ts ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   EActionType: () => (/* binding */ EActionType)\n/* harmony export */ });\n/** redux 内置action类型 */\nvar EActionType;\n(function (EActionType) {\n    /** 初始化Action */\n    EActionType[\"INIT\"] = \"@@redux/INIT\";\n    /** 更换Reducer 之后初始化Action类型*/\n    EActionType[\"REPLACE\"] = \"@@redux/REPLACE\";\n})(EActionType || (EActionType = {}));\n\n\n//# sourceURL=webpack://my-redux/./src/typings.ts?");

/***/ }),

/***/ "./src/utils/compose.ts":
/*!******************************!*\
  !*** ./src/utils/compose.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ compose)\n/* harmony export */ });\nfunction compose(...patchDispatch) {\n    return (dispatch) => {\n        return patchDispatch.reduce((currentDispatch, patchFn) => {\n            return patchFn(currentDispatch);\n        }, dispatch);\n    };\n}\n\n\n//# sourceURL=webpack://my-redux/./src/utils/compose.ts?");

/***/ })

/******/ });
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
/******/ 	__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 
/******/ 	// Return the exports of the module
/******/ 	return module.exports;
/******/ }
/******/ 
/************************************************************************/
/******/ /* webpack/runtime/define property getters */
/******/ (() => {
/******/ 	// define getter functions for harmony exports
/******/ 	__webpack_require__.d = (exports, definition) => {
/******/ 		for(var key in definition) {
/******/ 			if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 				Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 			}
/******/ 		}
/******/ 	};
/******/ })();
/******/ 
/******/ /* webpack/runtime/hasOwnProperty shorthand */
/******/ (() => {
/******/ 	__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ })();
/******/ 
/******/ /* webpack/runtime/make namespace object */
/******/ (() => {
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = (exports) => {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/ })();
/******/ 
/************************************************************************/
/******/ 
/******/ // startup
/******/ // Load entry module and return exports
/******/ // This entry module can't be inlined because the eval devtool is used.
/******/ var __webpack_exports__ = __webpack_require__("./src/index.ts");
/******/ const __webpack_exports__EActionType = __webpack_exports__.EActionType;
/******/ const __webpack_exports__applyMiddleWare = __webpack_exports__.applyMiddleWare;
/******/ const __webpack_exports__combineReducers = __webpack_exports__.combineReducers;
/******/ const __webpack_exports__createStore = __webpack_exports__.createStore;
/******/ export { __webpack_exports__EActionType as EActionType, __webpack_exports__applyMiddleWare as applyMiddleWare, __webpack_exports__combineReducers as combineReducers, __webpack_exports__createStore as createStore };
/******/ 
