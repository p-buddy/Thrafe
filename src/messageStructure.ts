export type PayloadType<T> = { payload: T };
export type ResponseType<T> = { response: T };

type TMessageConfig = PayloadType<any> | (PayloadType<any> & ResponseType<any>);

export type MessageStructureType = { [k: number]: TMessageConfig }
export type DefineMessageStructure<
  TEvents extends number,
  T extends MessageStructureType & Record<TEvents, TMessageConfig>
  > = T;

export type TPostedMessage = {
  event: number,
  payload: any,
  isResponse?: boolean,
  responseID?: number,
}