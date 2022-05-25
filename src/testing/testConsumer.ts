import { Thread } from "../development/Thread";
import { mockWorkerContext } from "./mockWorkerContext";
import { FromThreadEvents, Structure, testNumber, ToThreadEvents } from "./testWorker";

let thread: Thread<Structure>;
let errors = 0;

export const init = () => {
  thread = Thread.Test<Structure>(
    "testWorkerThread",
    {
      [FromThreadEvents.sendNumberFromThread]: (p) => console.log('hi'),
      [FromThreadEvents.sendNumberOutAndGetBack]: (p) => p,
    },
    mockWorkerContext.worker
  );
}

export const test = async () => {
  thread.dispatch(ToThreadEvents.passNumberToThread, testNumber);
  /*await thread.dispatch(ToThreadEvents.passNumberToThreadAndGetItBack, 4, (r) => {
    //console.log(r);
  });*/
}

export const check = () => errors === 0;
