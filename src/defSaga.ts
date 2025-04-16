import { ADD_NUM, FETCHDATA, SET_HUGE_DATA } from "./constants";
import { call, take, put, fork } from "./saga/io";
import {
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
    console.log(result);
    yield put({
      type: SET_HUGE_DATA,
      payload: result,
    });
    console.log("run fetchMockData end");
  } finally {
    return "err";
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
  yield throttle(1000, "FETCHDATA", fetchMockData);
}
