import * as mocha from 'mocha';
import * as chai from 'chai';
import { nameOfFile } from "./testing/testingUtility";
import { init as initWorker, test as testWorker, check as checkWorker } from "./testing/testWorker";
import { init as initConsumer, test as testConsumer, check as checkConsumer } from "./testing/testConsumer";

describe(nameOfFile(__filename), () => {
  describe("integration", () => {
    it("communication", async () => {
      initWorker();
      initConsumer();
      testWorker();
      await testConsumer();
      chai.expect(checkConsumer()).true;
      chai.expect(checkWorker()).true;
    });
  });
})