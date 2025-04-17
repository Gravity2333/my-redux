import { ADD_NUM, FETCHDATA, SET_HUGE_DATA, SUB_NUM } from "./constants";
import defSaga from "./defSaga";
import { createStore } from "./lib";
import applyMiddleWare from "./lib/applyMiddleware";
import { Action } from "./lib/typings";
import createSagaMiddleware from "./saga/middleware";

type ReducerState = {
  counter: number;
  hugeData: string;
};

interface ActionType extends Action {
  payload: any;
}

function reducer(state: ReducerState, action: ActionType): ReducerState {
  switch (action.type) {
    case ADD_NUM:
      return {
        ...state,
        counter: state.counter + action.payload,
      };
    case SUB_NUM:
      return {
        ...state,
        counter: state.counter - action.payload,
      };
    case SET_HUGE_DATA:
      return {
        ...state,
        hugeData: action.payload,
      };
    default:
      return (
        state || {
          counter: 0,
          hugeData: "",
        }
      );
  }
}

const sagaMiddleware = createSagaMiddleware();

const store = createStore<ReducerState, ActionType>(
  reducer,
  applyMiddleWare(sagaMiddleware)
);

sagaMiddleware.run(defSaga);

const plus10 = document.getElementById("plus10");
const minus10 = document.getElementById("minus10");
const mockDataShow = document.getElementById("mockData");
const fetchdataBtn = document.getElementById("fetchdata");
const counterShow = document.getElementById("counterShow");

plus10.addEventListener("click", () => {
  store.dispatch({
    type: ADD_NUM,
    payload: 20,
  });
});

minus10.addEventListener("click", () => {
  store.dispatch({
    type: SUB_NUM,
    payload: 20,
  });
});

fetchdataBtn.addEventListener("click", () => {
  store.dispatch({
    type: FETCHDATA,
    payload: 20,
  });
});

function updateDom() {
  counterShow.innerText = store.getState().counter + "";
  mockDataShow.innerText = store.getState().hugeData + "";
}

store.subscribe(() => {
  // console.log("state变动，counter为:", store.getState().counter);
  updateDom();
});

updateDom();
