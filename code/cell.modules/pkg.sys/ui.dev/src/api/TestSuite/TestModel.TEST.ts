import { t, time, expect } from '../../test';
import { Test } from '.';
import { TestModel } from './TestModel';
import { DEFAULT, Is } from './common';

describe('TestModel', () => {
  const description = 'foo';
  const parent = Test.describe('root');

  describe('model', () => {
    it('id: "Test.<slug>"', () => {
      const model = TestModel({ parent, description });
      expect(model.id.startsWith('Test.')).to.eql(true);
      expect(model.kind).to.eql('Test');
    });

    it('parent', () => {
      const model = TestModel({ parent, description });
      expect(model.parent).to.equal(parent);
    });

    it('description | handler', () => {
      const handler: t.TestHandler = () => null;
      const model1 = TestModel({ parent, description });
      const model2 = TestModel({ parent, description, handler });

      expect(model1.description).to.eql(description);
      expect(model2.description).to.eql(description);

      expect(model1.handler).to.eql(undefined);
      expect(model2.handler).to.eql(handler);
    });

    it('skip | only', () => {
      const model1 = TestModel({ parent, description });
      const model2 = TestModel({ parent, description, modifier: 'skip' });
      const model3 = TestModel({ parent, description, modifier: 'only' });

      expect(model1.modifier).to.eql(undefined);
      expect(model2.modifier).to.eql('skip');
      expect(model3.modifier).to.eql('only');
    });

    it('Is.test', () => {
      const test = (input: any, expected: boolean) => {
        expect(Is.test(input)).to.eql(expected);
      };

      test(undefined, false);
      test(null, false);
      test('', false);
      test(true, false);
      test(123, false);
      test([123], false);
      test({}, false);
      test(Test.describe('foo'), false);

      test('Test.1234', true);
      test(TestModel({ parent, description }), true);
    });

    it('clone', async () => {
      let count = 0;
      const handler: t.TestHandler = () => count++;
      const model1 = TestModel({ parent, description, handler });
      const model2 = model1.clone();

      expect(model1).to.not.equal(model2); // NB: different instance.
      expect(model1.id).to.not.eql(model2.id);

      // Equivalent everything else.
      expect(model1.handler).to.eql(model2.handler);
      expect(model1.description).to.eql(model2.description);
      expect(model1.parent).to.equal(model2.parent);

      await model1.run();
      expect(count).to.eql(1);

      await model2.run();
      expect(count).to.eql(2);
    });
  });

  describe('run', () => {
    const description = 'my-root';

    it('sync', async () => {
      let count = 0;
      const handler: t.TestHandler = () => count++;
      const test = TestModel({ parent, description, handler });

      const res = await test.run();
      expect(count).to.eql(1);

      expect(res.id).to.eql(test.id);
      expect(res.ok).to.eql(true);
      expect(res.timeout).to.eql(DEFAULT.TIMEOUT);
      expect(res.elapsed).to.greaterThan(-1);
      expect(res.error).to.eql(undefined);
      expect(res.description).to.eql(description);
      expect(res.excluded).to.eql(undefined);
    });

    it('async', async () => {
      let count = 0;
      const handler: t.TestHandler = async () => {
        await time.wait(50);
        count++;
      };
      const test = TestModel({ parent, description, handler });

      const res = await test.run();
      expect(count).to.eql(1);

      expect(res.id).to.eql(test.id);
      expect(res.ok).to.eql(true);
      expect(res.timeout).to.eql(DEFAULT.TIMEOUT);
      expect(res.elapsed).to.greaterThan(49);
      expect(res.error).to.eql(undefined);
    });

    it('with context (e.ctx)', async () => {
      const args: t.TestHandlerArgs[] = [];
      const handler: t.TestHandler = (e) => args.push(e);
      const test = TestModel({ parent, description, handler });

      const ctx = { foo: 123 };
      await test.run(); // NB: no context.
      await test.run({ ctx });

      expect(args[0].ctx).to.eql(undefined);
      expect(args[1].ctx).to.eql(ctx);
    });

    it('test throws error', async () => {
      const handler: t.TestHandler = () => {
        throw new Error('Derp');
      };
      const test = TestModel({ parent, description, handler });
      const res = await test.run();
      expect(res.ok).to.eql(false);
      expect(res.error?.message).to.eql('Derp');
    });

    it('no handler', async () => {
      const test = TestModel({ parent, description });
      const res = await test.run();
      expect(res.elapsed).to.lessThan(5);
      expect(res.error).to.eql(undefined);
    });

    it('skipped (it.skip modifier)', async () => {
      let count = 0;
      const handler: t.TestHandler = () => count++;

      const test = TestModel({ parent, description, handler, modifier: 'skip' });
      const res = await test.run();

      expect(res.excluded).to.eql(['skip']);
      expect(count).to.eql(0); // NB: test handler not invoked.
    });

    it('excluded (via test.run({ excluded }) parameter)', async () => {
      const test = async (excluded: t.TestModifier[] | undefined) => {
        let count = 0;
        const handler: t.TestHandler = () => count++;

        const testModel = TestModel({ parent, description, handler });
        const res = await testModel.run({ excluded });

        expect(res.excluded).to.eql(excluded);
        expect(count).to.eql(0); // NB: test handler not invoked.
      };

      await test(['only']);
      await test(['skip']);
      await test(['only', 'skip']);
    });

    it('not excluded (empty array parameter)', async () => {
      let count = 0;
      const handler: t.TestHandler = () => count++;

      const testModel = TestModel({ parent, description, handler });
      const res = await testModel.run({ excluded: [] }); // NB: Same as not specifying.

      expect(res.excluded).to.eql(undefined);
      expect(count).to.eql(1);
    });

    it('timeout', async () => {
      const handler: t.TestHandler = async () => await time.wait(20);
      const test = TestModel({ parent, description, handler });
      const res = await test.run({ timeout: 10 });
      expect(res.timeout).to.eql(10);
      expect(res.error?.message).to.include('Test timed out after 10 msecs');
    });

    it('timeout: custom set within test', async () => {
      const handler: t.TestHandler = async (e) => {
        await time.wait(5); //  Initial pause (within range)
        e.timeout(30); //       Reset timeout.
        await time.wait(25); // Wait for most of the new timeout.
      };
      const test = TestModel({ parent, description, handler });
      const res = await test.run({ timeout: 10 });
      expect(res.timeout).to.eql(30);
    });
  });
});
