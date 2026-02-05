import { Action, Middleware, Reducer, Store } from "./typings";
/** 应用中间件 */
export default function applyMiddleWare(...middlewares: Middleware[]): (createStore: <StateType = any, ActionType extends Action = Action>(reducer: Reducer<StateType, ActionType>, enhancer?: any) => Store<StateType, ActionType>) => (reducer: Reducer) => {
    dispatch: (...args: any[]) => never;
    getState: () => any;
    subscribe: (listenerCallback: import("./typings").ListenerCallback) => import("./typings").UnSubscribeListener;
    replaceReducer: (reducer: Reducer<any, Action>) => void;
};
