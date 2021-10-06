import { t, time, expect } from '../../test';
import { TestModel } from './Test';
import { DEFAULT } from './common';

describe('TestModel', () => {
  const description = 'foo';

  describe('model', () => {
    it('id: "Test.<slug>"', () => {
      const model = TestModel({ description });
      expect(model.id.startsWith('Test.')).to.eql(true);
    });

    it('description | handler', () => {
      const handler: t.TestHandler = () => null;
      const model1 = TestModel({ description });
      const model2 = TestModel({ description, handler });

      expect(model1.description).to.eql(description);
      expect(model2.description).to.eql(description);

      expect(model1.handler).to.eql(undefined);
      expect(model2.handler).to.eql(handler);
    });

    it('skip | only', () => {
      const model1 = TestModel({ description });
      const model2 = TestModel({ description, modifier: 'skip' });
      const model3 = TestModel({ description, modifier: 'only' });

      expect(model1.modifier).to.eql(undefined);
      expect(model2.modifier).to.eql('skip');
      expect(model3.modifier).to.eql('only');
    });
  });
  describe('run', () => {
    const description = 'my-root';

    it('sync', async () => {
      let count = 0;
      const handler: t.TestHandler = () => count++;
      const test = TestModel({ description, handler });

      const res = await test.run();
      expect(res.ok).to.eql(true);
      expect(res.timeout).to.eql(DEFAULT.TIMEOUT);
      expect(res.elapsed).to.greaterThan(0);
      expect(res.error).to.eql(undefined);
      expect(res.description).to.eql(description);
      expect(res.skipped).to.eql(undefined);
    });

    it('async', async () => {
      const handler: t.TestHandler = async () => await time.wait(50);
      const test = TestModel({ description, handler });
      const res = await test.run();
      expect(res.ok).to.eql(true);
      expect(res.timeout).to.eql(DEFAULT.TIMEOUT);
      expect(res.elapsed).to.greaterThan(49);
      expect(res.error).to.eql(undefined);
    });

    it('test throws error', async () => {
      const handler: t.TestHandler = () => {
        throw new Error('Derp');
      };
      const test = TestModel({ description, handler });
      const res = await test.run();
      expect(res.ok).to.eql(false);
      expect(res.error?.message).to.eql('Derp');
    });

    it('no handler', async () => {
      const test = TestModel({ description });
      const res = await test.run();
      expect(res.elapsed).to.lessThan(5);
      expect(res.error).to.eql(undefined);
    });

    it('skipped', async () => {
      let count = 0;
      const handler: t.TestHandler = () => count++;

      const test = TestModel({ description, handler, modifier: 'skip' });
      const res = await test.run();

      expect(res.skipped).to.eql(true);
      expect(count).to.eql(0); // NB: test handler not invoked.
    });

    it('skipped (via {skip} param)', async () => {
      let count = 0;
      const handler: t.TestHandler = () => count++;

      const test = TestModel({ description, handler });
      const res = await test.run({ skip: true });

      expect(res.skipped).to.eql(true);
      expect(count).to.eql(0); // NB: test handler not invoked.
    });

    it('timeout', async () => {
      const handler: t.TestHandler = async () => await time.wait(20);
      const test = TestModel({ description, handler });
      const res = await test.run({ timeout: 10 });
      expect(res.timeout).to.eql(10);
      expect(res.error?.message).to.include('Timed out after 10 msecs');
    });

    it('timeout: custom set within test', async () => {
      const handler: t.TestHandler = async (e) => {
        await time.wait(5); //  Initial pause (within range)
        e.timeout(30); //       Reset timeout.
        await time.wait(25); // Wait for most of the new timeout.
      };
      const test = TestModel({ description, handler });
      const res = await test.run({ timeout: 10 });
      expect(res.timeout).to.eql(30);
    });
  });
});
