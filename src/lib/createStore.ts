import { Action, ListenerCallback, Reducer } from "./typings";

/** createStore 函数 用来创建store对象 */
export default function createStore<StateType = any, ActionType = Action>(
  reducer: Reducer<StateType, ActionType>,
  enhancer?: any
) {
  /** 判断enhancer是否传入，如果传入则传入createStore reducer等*/
  if (typeof enhancer !== "undefined") {
    if (typeof enhancer !== "function") {
      throw new Error("enhancer参数需要传入一个函数！");
    }
    // TODO enhance 中间件逻辑
  }

  /** 当前的状态 初始化为null */
  let currentState: StateType = null;
  /** 当前的reducer函数 初始化为reducer入参 */
  let currentReducer: Reducer<StateType, ActionType> = reducer;
  /** 当前listener Map  */
  let currentListeners: Map<number, ListenerCallback> = new Map();
  /** next listener Mao */
  let nextListeners: Map<number, ListenerCallback> = currentListeners;
  /** listener 计数器 用来作为Map的key */
  let listenerCnt = 0;
  /** reducer 锁，表示正在执行reducer，reducer要求是纯函数，
   * 1. 不能在reducer中调用dispatch等
   * 2. 不能在reduer中读取获得state  reducer的state只能从入参获得
   * 这是为了保证reducer的原子性 使用getState会绕过快照机制，不能保证确定的state和确定的action返回确定的结果
   * */
  let isDispatching = false;

  /** 保证能够修改 nextListeners Map对象
   *  
   */
  function ensureCanMutatenextListeners(){

  }

  /** 监听器中调用dispatch会导致死循环 */
}
