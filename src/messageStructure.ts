export type PayloadType<T> = { payload: T };
export type ResponseType<T> = { response: T };
export type Context = Window;

type TMessageConfig = PayloadType<any> | (PayloadType<any> & ResponseType<any>);

export type OneWayMessageStructureType = { [k: number]: TMessageConfig }

export type ThreadMessageType = {
  Name: string,
  ToThread: OneWayMessageStructureType,
  FromThread: OneWayMessageStructureType,
}

export type DefineOneWayMessageStructure<
  TEvents extends number,
  T extends OneWayMessageStructureType & Record<TEvents, TMessageConfig>
  > = T;

export type DefineThread<
  TName extends string,
  TToThread extends OneWayMessageStructureType,
  TFromThread extends OneWayMessageStructureType> = {
    Name: TName,
    ToThread: TToThread,
    FromThread: TFromThread,
  }

export type TPostedMessage = {
  event: number,
  payload: any,
  isResponse?: boolean,
  responseID?: number,
}

export type AsNumber<T> = T & number;
export type TKeysMatching<TBase, TQueryType> = {
  [K in keyof TBase]-?: TBase[K] extends TQueryType ? K : never }[keyof TBase];
export type TKeysNotMatching<TBase, TQueryType> = {
  [K in keyof TBase]-?: TBase[K] extends TQueryType ? never : K
}[keyof TBase];

export type OneWayEvents<T extends OneWayMessageStructureType> = number & TKeysNotMatching<T, ResponseType<any>>;
export type TwoWayEvents<T extends OneWayMessageStructureType> = number & TKeysMatching<T, ResponseType<any>>;