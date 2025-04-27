import { MiddlewareAPI } from "../../lib/typings";

export function thunk(middlewareApi: MiddlewareAPI) {
  return (next) => (action) => {
    if (typeof action === "function") {
      action(next, middlewareApi.getState);
    } else {
      next(action);
    }
  };
}
