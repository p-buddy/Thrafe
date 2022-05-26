import * as mocha from 'mocha';
import * as chai from 'chai';
import { compareContexts, nameOfFile } from "./testing/testingUtility";
import { testContext as workerContext } from "./testing/testWorker";
import { testContext as consumerContext } from "./testing/testConsumer";

describe(nameOfFile(__filename), () => {
  describe("integration", () => {
    it("communication", async () => {
      workerContext.init();
      consumerContext.init();
      await workerContext.test();
      await consumerContext.test();
      chai.expect(workerContext.errors).to.equal(0);
      chai.expect(consumerContext.errors).to.equal(0);
      compareContexts(workerContext, consumerContext);
    });
  });
})