import { Dispatch } from "../typings";

export default function compose(...patchDispatch: any[]){
    return (dispatch: Dispatch) => {
        patchDispatch.reduce((currentDispatch,patchFn)=>{
            return patchFn(currentDispatch)
        },dispatch)
    }
}