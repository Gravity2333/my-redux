/** redux 内置action类型 */
export enum EActionType {
  /** 初始化Action */
  INIT = `@@redux/INIT`,
  /** 更换Reducer 之后初始化Action类型*/
  REPLACE = `@@redux/REPLACE`,
}

/** Action类型 */
export interface Action {
  type: string;
}

/** Reducer类型 */
export interface Reducer<StateType = any, ActionType = Action> {
  (state: StateType, action: ActionType): StateType;
}

/** 监听器 listener callback */
export type ListenerCallback = () => void;
