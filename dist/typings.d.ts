/** redux 内置action类型 */
export declare enum EActionType {
    /** 初始化Action */
    INIT = "@@redux/INIT",
    /** 更换Reducer 之后初始化Action类型*/
    REPLACE = "@@redux/REPLACE"
}
/** Action类型 */
export interface Action {
    type: string;
}
/** Reducer类型 */
export interface Reducer<StateType = any, ActionType extends Action = Action> {
    (state: StateType, action: ActionType): StateType;
}
/** 监听器 listener callback */
export type ListenerCallback = () => void;
export type UnSubscribeListener = () => void;
/** dispatch */
export type Dispatch<ActionType extends Action = Action> = (action: ActionType) => void;
/** store类型 */
export interface Store<StateType = any, ActionType extends Action = Action> {
    getState: () => StateType | null;
    subscribe: (listenerCallback: ListenerCallback) => UnSubscribeListener;
    dispatch: Dispatch<ActionType>;
    replaceReducer: (reducer: Reducer<StateType, ActionType>) => void;
}
export interface MiddlewareAPI<StateType = any, ActionType extends Action = Action> {
    dispatch: Dispatch<ActionType>;
    getState: () => StateType;
}
/** 中间件类型 store => dispatch => dispatch */
export type Middleware = <StateType = any, ActionType extends Action = Action>(store: MiddlewareAPI<StateType, ActionType>) => (dispatch: Dispatch<ActionType>) => Dispatch<ActionType>;
