import { Action, Reducer } from "./typings";
/** 结合reducer */
export declare function combineReducers(reducerMap: Record<string, Reducer<any, Action>>): Reducer<any, Action>;
