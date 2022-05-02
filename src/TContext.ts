type TContext =
  { onmessage: Window['onmessage'] | Worker['onmessage'] }
  & { postMessage: Window['postMessage'] | Worker['postMessage'] };

export default TContext;