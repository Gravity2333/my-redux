import { Action, Middleware, MiddlewareAPI, Reducer, Store } from "./typings";
import compose from "./utils/compose";

/** 应用中间件 */
export default function applyMiddleWare(
  ...middlewares: Middleware[]
) {
  (
      createStore: <StateType = any, ActionType extends Action = Action>(
        reducer: Reducer<StateType, ActionType>,
        enhancer?: any
      ) => Store<StateType, ActionType>
    ) =>
    (reducer: Reducer) => {
      const store = createStore(reducer);

      const middlewareApi: MiddlewareAPI = {
        /** 创建middleware的时候 不能调用dispatch */
        dispatch: () => {
          throw new Error("创建中间件的过程中 不能调用dispatch");
        },
        getState: store.getState
      };

      const dispatchPatchChain = middlewares.map(middleware => middleware(middlewareApi));
      const dispatch = compose(...dispatchPatchChain)(store.dispatch)
      return {
        ...store,dispatch
      };
    };
}
