import { Thrafe } from "./Thrafe";

type Scope =
  { onmessage: Window['onmessage'] | Worker['onmessage'] }
  & { postMessage: Window['postMessage'] | Worker['postMessage'] }
  & { thrafe?: Thrafe };

export default Scope;