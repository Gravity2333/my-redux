### applyMiddleWare 如何工作

```javascript
function applyMiddleware(middlewares) {
  return (createStore) => (reducer) => {
    const store = createStore(reducer);
    let dispatch = function () {
      throw new Error(
        "你不能在middleware构建的过程中调用 dispatch [ dispatch此时还没有创建完 ]",
      );
    };
    const middlewareAPI = {
      dispatch,
      getState: store.getState,
    };

    const patches = middlewares.forEach((middleware) =>
      middleware(middlewareApi),
    );
    dispatch = compose(patches)(store.dispatch);
    store.dispatch = dispatch;
    return store;
  };
}
```

这个设计很奇妙，目的是让插件内部，不要在 dispatch 没有 patch 完成之前调用 dispatch
middlewareAPI 的 dispatch 引用外部词法环境的 let dispatch
在 dispatch 没有 patch 完成之前，dispatch 都指向一个会 throw err 的函数
只有当完成 dispatch 的 patch 才会正常执行

### 插件如何工作 - redux-thunk

```javascript
funcation thunk(middlewareAPI){
    return dispatch => action => {
        if(typeof action === 'function'){
            // patch
            action(dispatch,middlewareAPI.getState)
        }else{
            dispatch(action)
        }
    }
}
```

### compose 如何工作

compose 函数就是个流水线的功能 类似于 pipe！ 内部调用 reduce

```javascript
function compose(patchChain) {
  return (originDispatch) =>
    patchChain.reduce((prevDispatch, currentPatch) => {
      return currentPatch(prevDispatch);
    }, originDispatch);
}
```
