import { ADD_NUM, FETCHDATA, SET_HUGE_DATA } from "./constants";
import { call, take, put, fork, select, all, race, detach, spawn } from "./saga/io";
import {
  delay,
  takeEvery,
  takeLatest,
  takeLeading,
  throttle,
} from "./saga/io-helpers";
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

function* fetchData(timeout: number) {
  try {
    const result = yield call(fetchMockHugeData, timeout);
    console.log("fetchData结果 ",timeout,result);
    return result;
  } finally {
    console.log("fetchData结束了!",timeout);
  }
}

export default function* defSaga() {
  // while (1) {
  //   yield take({
  //     type: ADD_NUM,
  //     payload: "",
  //   });
  //   console.log("add");
  // }
  // const genATask = yield fork(genA);
  // console.log(genATask)
  // genATask.cancel()
  // console.log(genATask)
  // const genBTask = yield fork(genB);
  // yield fork(takeLatest,"FETCHDATA", fetchMockData)
  // // console.log(yield call(fetchData))
  // console.log('before delay')
  // yield delay(2000)
  // console.log('after delay')
  // const results = yield all([
  //   call(fetchData, 100),
  //   call(fetchData, 100),
  //   call(fetchData, 1000),
  //   call(fetchData, 100),
  //   call(fetchData, 1000),
  // ]);
  // console.log(results);
  const task = yield fork(function* () {
    try {
      yield detach(fork(fetchData, 1000));
      yield detach(fork(fetchData, 2000));
      yield spawn(fetchData, 3000);
    } finally {
      console.log("外层取消了");
    }
  });
  task.aaa=111
  console.log(task)
  task.cancel();
  // console.log("after call");
  // yield fork(function* (){
  //   yield fork(fetchData,1000)
  //   yield fork(fetchData,2000)
  //   yield fork(fetchData,3000)
  // })
  // console.log('after fork')
}
