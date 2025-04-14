import { ADD_NUM, FETCHDATA, SET_HUGE_DATA } from "./constants";
import { call, take,put } from "./saga/io";
import { fetchMockHugeData } from "./services";
export default function* defSaga() {
  // while (1) {
  //   yield take({
  //     type: ADD_NUM,
  //     payload: "",
  //   });
  //   console.log("add");
  // }

  while (1) {
    yield take({
      type: FETCHDATA,
    });
    const result = yield call(fetchMockHugeData, "arg1", "arg2");
    yield put({
      type: SET_HUGE_DATA,
      payload: result
    })
  }
}
