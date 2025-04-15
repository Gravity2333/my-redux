import { ADD_NUM, FETCHDATA, SET_HUGE_DATA } from "./constants";
import { call, take, put, fork } from "./saga/io";
import { fetchMockHugeData } from "./services";

function* genA() {
  yield put({ type: "A" });
  yield take("B");
  console.log("genA take(B)")
}

function* genB() {
  yield take("A");
  console.log("genB take(A)")
  yield put({ type: "B" });
}

export default function* defSaga() {
  // while (1) {
  //   yield take({
  //     type: ADD_NUM,
  //     payload: "",
  //   });
  //   console.log("add");
  // }
  yield fork(genA)
  yield fork(genB)

  // while (1) {
  //   yield take(FETCHDATA);
  //   const result = yield fork(fetchMockHugeData, "arg1", "arg2");
  //   console.log(result);
  //   yield put({
  //     type: SET_HUGE_DATA,
  //     payload: result,
  //   });
  // }
}
