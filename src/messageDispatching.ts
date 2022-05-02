import type TContext from './TContext';
import { addResponseHandler } from "./messageHandling";
import type { MessageStructureType, ResponseType, TPostedMessage } from "./messageStructure";

export type TOnResponse<
  TStructure extends MessageStructureType,
  TEventKey extends keyof TStructure & number> =
  TStructure[TEventKey] extends ResponseType<any>
  ? [(response: TStructure[TEventKey]['response']) => void]
  : [];

export const dispatch = <
  TStructure extends MessageStructureType,
  TEventKey extends keyof TStructure & number>(
    context: TContext,
    event: TEventKey,
    payload: TStructure[TEventKey]['payload'],
    ...onResponse: TOnResponse<TStructure, TEventKey>
  ) => {
  onResponse.length > 0
    ? context.postMessage({ event, payload, responseID: addResponseHandler<TStructure, TEventKey>(context, event, onResponse[0] as any) } as TPostedMessage)
    : context.postMessage({ event, payload } as TPostedMessage);
}
