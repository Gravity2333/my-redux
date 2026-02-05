import {
  Action,
  EActionType,
  ListenerCallback,
  Reducer,
  Store,
} from "./typings";

/** createStore 函数 用来创建store对象 */
export default function createStore<
  StateType = any,
  ActionType extends Action = Action,
>(
  reducer: Reducer<StateType, ActionType>,
  enhancer?: any,
): Store<StateType, ActionType> {
  /** 判断enhancer是否传入，如果传入则传入createStore reducer等*/
  if (typeof enhancer !== "undefined") {
    if (typeof enhancer !== "function") {
      throw new Error("enhancer参数需要传入一个函数！");
    }

    return enhancer(createStore)(reducer);
  }

  /** 当前的状态 初始化为null */
  let currentState: StateType | null = null;
  /** 当前的reducer函数 初始化为reducer入参 */
  let currentReducer: Reducer<StateType, ActionType> = reducer;
  /** 当前listener Map  */
  let currentListeners: Map<number, ListenerCallback> | null = new Map();
  /** next listener Map */
  let nextListeners: Map<number, ListenerCallback> = currentListeners;
  /** listener 计数器 用来作为Map的key */
  let listenerCnt = 0;
  /** reducer 锁，表示正在执行reducer，reducer要求是纯函数，
   * 1. 不能在reducer中调用dispatch等2050
   * 2. 不能在reduer中读取获得state  reducer的state只能从入参获得
   * 这是为了保证reducer的原子性 使用getState会绕过快照机制，不能保证确定的state和确定的action返回确定的结果
   * */
  let isDispatching = false;

  /** 举个例子说明为什么需要双缓冲
   *  1. 什么是双缓冲，就是在要修改listener的时候先拷贝一份出来，在这个拷贝的列表中修改
   *  2. 在读取listener的时候 把currentListener 和 nextListener 合并 （用next代替current）
   *
   *  为什么要这么设计?
   *  dispatch函数中，执行reducer的阶段 不能注册 卸载事件
   *  但是在reducer之后之后，执行listener的阶段，没有这些限制
   *  如果一个listener
   *  const unlistener = store.listen(()=>{
   *    unlistener() // 自杀
   *  })
   *
   *  或者
   *  store.listen(()=>{
   *     store.listen(()=>{ // 注册其他的监听函数
   *        console.log('inner listener')
   *     })
   *   })
   *
   *  会导致监听器执行混乱，需要保证执行的时候定死遍历列表，这就需要在需要修改listerList的时候，先拷贝一份新的出来！
   */

  /**
   *  保证能够修改 nextListeners Map对象
   *  redux采用双缓冲策略 使用 nextListeners 存储最新的listener currentListener存储旧的listener
   *  当subscirbe的时候 只修改nextListener
   *  当trigger的时候，同步nextListener 和 currentListener
   *  为了防止listener trigger的时候再次调用subscribe导致listener Map变大 在执行trigger之前，同步两个Map
   *  每次subscirbe的时候都会检查，如果两个Map相同，那么就创建一个Map快照赋给nextListeners ，然后操作nextListeners
   *  这样即便在trigger时subscribe 也不会影响当前遍历的map
   */
  function ensureCanMutatenextListeners() {
    if (nextListeners === currentListeners) {
      /** 创建快照 赋给nextListeners */
      nextListeners = new Map();
      currentListeners.forEach((listener, key) => {
        nextListeners.set(key, listener);
      });
    }
  }

  /** dispatch 函数执行的过程中 会调用reducer函数 要求
   * reducer函数内 不能调用getState
   * reducer函数内 不能调用dispatch 会死循环
   * reducer函数内 不能注册/取消注册listener 会破坏纯函数
   */
  function dispatch(action: ActionType) {
    /** 检查action合法性 */
    if (typeof action !== "object")
      throw new Error("dispatch错误: 请传入一个对象类型的Action");
    if (typeof action.type !== "string")
      throw new Error("dispatch错误: Action.type必须为string");
    if (isDispatching) {
      /** 如果isDispatching = true 表示当前正在运行reducer 此时为了保证reducer是纯函数 其内部
       * 1. 不能调用dispatch 可能导致死循环
       * 2. 不能调用getState获取state
       */
      throw new Error(
        "dispatch错误: 无法在reducer函数内调用dispatch 请保证reducer为纯函数！",
      );
    }

    /** 调用reducer */
    try {
      isDispatching = true;
      /** 调用reducer 获取新的state */
      currentState = currentReducer(currentState!, action);
    } finally {
      isDispatching = false;
    }

    /** trigger listener */
    /** 同步nextListeners 和 currentListeners */
    const listener = (currentListeners = nextListeners);
    listener.forEach((listener) => listener());
  }

  /** subscribe 函数 */
  function subscribe(listenerCallback: ListenerCallback) {
    if (typeof listenerCallback !== "function")
      throw new Error("subscribe错误: listenerCallback必须是函数类型！");
    /** 保证reducer是纯函数
     *  1. 在其中不能dispatch
     *  2. 不能注册listener
     *  3. 不能调用getState
     */
    if (isDispatching)
      throw new Error(
        `subscribe错误: 不能在reducer中注册listener 请保证reducer是纯函数`,
      );
    /** 开始注册，先检查当前双缓冲书否为同步状态，如果同步，创建快照
     *  场景：在监听函数里“自杀” (Unsubscribe)
     *  场景：在监听函数里“繁衍” (Subscribe)
     */
    ensureCanMutatenextListeners();
    const listenerId = listenerCnt++;
    nextListeners.set(listenerId, listenerCallback);
    /** 表示已经注册
     *  多次调用unsubscribe函数的时候 只能执行一次
     */
    let isSubscribed = true;
    /** ub subscribe 函数 */
    return () => {
      if (!isSubscribed) return; // 防止多次unsubcribe
      /** 保证在reducer中也不能 unsubcribe */
      if (isDispatching)
        throw new Error(
          `unsubscribe错误: 不能在reducer中注销listener 请保证reducer是纯函数`,
        );
      isSubscribed = false;
      /** 删除前也需要先创建快照 */
      ensureCanMutatenextListeners();
      nextListeners.delete(listenerId);
      currentListeners = null; // current没用了 可以直接回收
    };
  }

  /** getState 在dispacth中 不能调用
   *  为什么在 reducer函数内不能调用getSate
   *  因为要保证reducer是纯函数，其结果只有由state & action 决定
   *  state相当于执行前传入的state快照
   *  如果在reducer中修改了state，就会导致纯函数会破坏
   */
  function getState(): StateType | null {
    if (isDispatching)
      throw new Error("无法在reducer中调用 getState 请保证reducer是纯函数");
    return currentState;
  }

  /** 更换reducer */
  function replaceReducer(reducer: Reducer<StateType, ActionType>) {
    if (typeof reducer !== "function")
      throw new Error("reducer 必须是一个函数！");
    currentReducer = reducer;
    /** 重新dispatch 给state赋值 */
    dispatch({ type: EActionType.REPLACE } as ActionType);
  }

  /** 初始化reducer 获得initialState */
  dispatch({ type: EActionType.INIT } as ActionType);
  return {
    dispatch,
    subscribe,
    getState,
    replaceReducer,
  };
}
