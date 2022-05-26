export type Payload<T> = { payload: T };
export type Response<T> = { response: T };
export type Scope = Window;

type TMessageConfig<TPayload, TResponse = never> = Payload<TPayload> | (Payload<TPayload> & Response<TResponse>);

export type OneWayMessageStructureType = { [k: number]: TMessageConfig<any, any> }

export type ThreadArchitecture = {
  Name: string,
  ToThread: OneWayMessageStructureType,
  FromThread: OneWayMessageStructureType,
}

export type DefineOneWayMessageStructure<
  TEvents extends number,
  T extends OneWayMessageStructureType & Record<TEvents, TMessageConfig<any, any>>
  > = T;

export type DefineThreadArchitecture<
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

export type OneWayEvents<T extends OneWayMessageStructureType> = number & TKeysNotMatching<T, Response<any>>;
export type TwoWayEvents<T extends OneWayMessageStructureType> = number & TKeysMatching<T, Response<any>>;

export type CommunicationDirection = TKeysMatching<ThreadArchitecture, OneWayMessageStructureType>;

export type MainThreadContext = "MainThread";
export type WorkerThreadContext = "WorkerThread";
export type ThreadContext = MainThreadContext | WorkerThreadContext;
export type HandleDirectionByContext<TContext extends ThreadContext> = keyof ThreadArchitecture & (TContext extends MainThreadContext ? "FromThread" : "ToThread");
export type DispatchDirectionByContext<TContext extends ThreadContext> = keyof ThreadArchitecture & (TContext extends MainThreadContext ? "ToThread" : "FromThread");