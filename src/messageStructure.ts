export type PayloadType<T> = { payload: T };
export type ResponseType<T> = { response: T };
export type Context = Window;

type TMessageConfig = PayloadType<any> | (PayloadType<any> & ResponseType<any>);

export type MessageStructureType = { [k: number]: TMessageConfig }

export type ThreadMessageType = {
  Name: string,
  ToThread: MessageStructureType,
  FromThread: MessageStructureType,
}

export type DefineMessageStructure<
  TEvents extends number,
  T extends MessageStructureType & Record<TEvents, TMessageConfig>
  > = T;

export type DefineThreadMessaging<
  CompiledName extends string,
  TToThread extends MessageStructureType,
  TFromThread extends MessageStructureType> = {
    Name: CompiledName,
    ToThread: TToThread,
    FromThread: TFromThread,
  }

export type TPostedMessage = {
  event: number,
  payload: any,
  isResponse?: boolean,
  responseID?: number,
}