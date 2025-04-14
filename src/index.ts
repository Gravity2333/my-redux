import { createStore } from "./lib";
import applyMiddleWare from "./lib/applyMiddleware";
import { Action } from "./lib/typings";
import { take } from "./saga/io";
import createSagaMiddleware from './saga/middleware'

type ReducerState = {
  counter: number;
};

interface ActionType extends Action {
  payload: any;
}

const ADD_NUM = "ADD_NUM";
const SUB_NUM = "SUB_NUM";

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
    default:
      return (
        state || {
          counter: 0,
        }
      );
  }
}

const sagaMiddleware = createSagaMiddleware()

const store = createStore<ReducerState, ActionType>(reducer, applyMiddleWare(sagaMiddleware));

sagaMiddleware.run(function* (){
  while(1){
    yield take({
      type: ADD_NUM,
      payload: ''
    })
    console.log('add')
  }
})

const plus10 = document.getElementById("plus10");
const minus10 = document.getElementById("minus10");
const counterShow = document.getElementById("counterShow");

plus10.addEventListener("click", () => {
  store.dispatch({
    type: ADD_NUM,
    payload: 10,
  });
});

minus10.addEventListener("click", () => {
  store.dispatch({
    type: SUB_NUM,
    payload: 10,
  });
});

function updateDom() {
  counterShow.innerText = store.getState().counter + "";
}

store.subscribe(() => {
  console.log("state变动，counter为:", store.getState().counter);
  updateDom();
});

updateDom();
