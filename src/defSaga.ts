import { ADD_NUM, FETCHDATA, SET_HUGE_DATA } from "./constants";
import {
  call,
  take,
  put,
  fork,
  select,
  all,
  race,
  detach,
  spawn,
} from "./middlewares/saga";
import {
  delay,
  takeEvery,
  takeLatest,
  takeLeading,
  throttle,
} from "./middlewares/saga";
import { CANCEL } from "./middlewares/saga/effectTypes";
import { noop } from "./middlewares/saga/utils";
import { fetchMockHugeData } from "./services";

function* genA() {
  yield put({ type: "A" });
  yield take("B");
  console.log("genA take(B)");
}

function* genB() {
  yield take("A");
  console.log("genB take(A)");
  yield put({ type: "B" });
}

function* fetchMockData() {
  try {
    console.log("run fetchMockData");
    const result = yield call(fetchMockHugeData, "arg1", "arg2");
    const counter = yield select((state) => state.counter);
    console.log("counter is ", counter);
    yield put({
      type: SET_HUGE_DATA,
      payload: result + counter,
    });
    console.log("run fetchMockData end");
  } finally {
    return "err";
  }
}

function* pollingData() {
  while (1) {
    const pollingData = yield call(fetchData);
    console.log("轮询数据", pollingData);
    // 延迟3s
    delay(3000);
  }
}

// function mockFetchFunc(){
//   let cancelCallback = null
//   const p = new Promise((resolve,reject) => {
//     setTimeout(() => {
//       resolve('请求返回 MOCK DATA')
//     }, 3000);

//     cancelCallback = ()=>{
//       console.log('请求被取消')
//       reject('请求被取消')
//     }
//   })

//   p[CANCEL]=cancelCallback

//   return p
// }
// export default function* defSaga() {
//   const task = yield fork(mockFetchFunc)
//   task.cancel()
// }

function fetchData(timeout: number) {
  let cancelCallback = noop;
  const p = new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(`currentTime:  ${timeout}  ` + new Date());
    }, timeout);
    cancelCallback = () => {
      console.log("task取消 timeout = " + timeout);
    };
  });
  p[CANCEL] = cancelCallback;
  return p;
}


function* parentTask() {
  yield fork(function*(){
    return yield call(fetchData,1000)
  });
  yield fork(function*(){
    return yield call(fetchData,2000)
  });
  yield fork(function*(){
    return yield call(fetchData,4000)
  });
}

export default function* defSaga() {
  const task = yield fork(parentTask);
 setTimeout(() => {
  task.cancel();
 }, 1000);
}
