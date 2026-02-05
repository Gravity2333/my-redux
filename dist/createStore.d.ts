import { Action, Reducer, Store } from "./typings";
/** createStore 函数 用来创建store对象 */
export default function createStore<StateType = any, ActionType extends Action = Action>(reducer: Reducer<StateType, ActionType>, enhancer?: any): Store<StateType, ActionType>;
