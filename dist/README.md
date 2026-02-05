# 简易版 Redux 实现（学习版）

一个为学习 Redux 原理而手动实现的简易版 Redux。  
包括 `createStore`、`applyMiddleware`、中间件（Saga）等核心机制，适合学习和调试。

解析请关注我的CSDN博客 https://blog.csdn.net/weixin_40710412/article/details/147550588?spm=1001.2014.3001.5501


---

## 📖 目录

- [背景介绍](#背景介绍)
- [快速使用](#快速使用)
- [源码示例](#源码示例)

---

## 背景介绍

为了更好地理解 Redux 的内部原理，特地动手从零实现了一个简版 Redux。  
项目整体保持 Redux 核心思想，同时精简了边界处理，便于学习和掌握。

---

## 快速使用

引入并使用自己的 `createStore`、`applyMiddleware`、`sagaMiddleware`，即可完成状态管理和副作用处理。

1. 初始化 store
2. 绑定 DOM 事件
3. 通过 `dispatch` 修改状态
4. 订阅 state 更新，刷新界面

---

## 源码示例

```typescript
import { ADD_NUM, FETCHDATA, SET_HUGE_DATA, SUB_NUM } from "./constants";
import defSaga from "./defSaga";
import { createStore } from "./lib";
import applyMiddleWare from "./lib/applyMiddleware";
import { Action } from "./lib/typings";
import createSagaMiddleware from "./middlewares/saga";

type ReducerState = {
  counter: number;
  hugeData: string;
};

interface ActionType extends Action {
  payload: any;
}

// Reducer 函数
function reducer(state: ReducerState, action: ActionType): ReducerState {
  switch (action.type) {
    case ADD_NUM:
      return { ...state, counter: state.counter + action.payload };
    case SUB_NUM:
      return { ...state, counter: state.counter - action.payload };
    case SET_HUGE_DATA:
      return { ...state, hugeData: action.payload };
    default:
      return (
        state || {
          counter: 0,
          hugeData: "",
        }
      );
  }
}

// 创建 Saga 中间件
const sagaMiddleware = createSagaMiddleware();

// 创建 Store，应用中间件
const store = createStore<ReducerState, ActionType>(
  reducer,
  applyMiddleWare(sagaMiddleware)
);

// 启动 saga
sagaMiddleware.run(defSaga);

// 绑定 DOM 元素
const plus10 = document.getElementById("plus10");
const minus10 = document.getElementById("minus10");
const mockDataShow = document.getElementById("mockData");
const fetchdataBtn = document.getElementById("fetchdata");
const counterShow = document.getElementById("counterShow");

// 绑定点击事件
plus10.addEventListener("click", () => {
  store.dispatch({ type: ADD_NUM, payload: 20 });
});

minus10.addEventListener("click", () => {
  store.dispatch({ type: SUB_NUM, payload: 20 });
});

fetchdataBtn.addEventListener("click", () => {
  store.dispatch({ type: FETCHDATA, payload: 20 });
});

// 更新页面显示
function updateDom() {
  counterShow.innerText = store.getState().counter + "";
  mockDataShow.innerText = store.getState().hugeData + "";
}

// 监听 state 变化
store.subscribe(() => {
  updateDom();
});

// 初始化页面
updateDom();
```

