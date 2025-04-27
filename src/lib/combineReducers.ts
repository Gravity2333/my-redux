import { Action } from "../../参考/src";
import { Reducer } from "./typings";

/** 结合reducer */
export function combineReducers(reducerMap: Record<string,  Reducer<any, Action>>): Reducer<any, Action>{
    return (state: any,action: Action) => {
        return Object.keys(reducerMap).reduce((newState: any,currentReducerKey) => {
            newState[currentReducerKey] = reducerMap[currentReducerKey](state,action)
            return newState
        }, {})
    }
}