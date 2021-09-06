import { t, time, expect } from '../../test';
import { TestSuite } from '.';

describe.only('TestSuite', () => {
  describe('model', () => {
    it('empty (no handler)', () => {
      const root = TestSuite.describe('root');
      expect(root.state.description).to.eql('root');
      expect(root.state.children).to.eql([]);
      expect(root.state.tests).to.eql([]);
      expect(root.state.ready).to.eql(false);
      expect(root.state.modifier).to.eql(undefined);
    });

    it('handler (not initialized)', () => {
      const handler: t.TestSuiteHandler = (e) => null;
      const root = TestSuite.describe('root', handler);
      expect(root.state.ready).to.eql(false);
    });

    it('timeout', () => {
      const children: t.TestSuiteModel[] = [];

      const root1 = TestSuite.describe('root-1', (e) => {
        const root2 = e.describe('root-2', (e) => {
          e.timeout(-99);
          const root3 = e.describe('root-3', (e) => {
            e.timeout(0).timeout(5000);
          });
          children.push(root3);
        });
        children.push(root2);
      });

      // Default (not initialized yet).
      expect(root1.state.timeout).to.eql(undefined);
      root1.state.init();
      const root2 = children[0];
      const root3 = children[1];

      expect(root1.state.timeout).to.eql(undefined);
      expect(root2.state.timeout).to.eql(0); // NB: clamped.
      expect(root3.state.timeout).to.eql(5000);
    });

    it('initialize (single test)', () => {
      let test: t.TestModel | undefined = undefined;
      let count = 0;
      const handler: t.TestHandler = () => null;

      const root = TestSuite.describe('root', (e) => {
        count++;
        test = e.it('foo', handler);
      });

      expect(root.state.description).to.eql('root');
      expect(root.state.ready).to.eql(false);
      expect(count).to.eql(0);

      const res1 = root.state.init();
      expect(res1).to.equal(root);
      expect(root.state.ready).to.eql(true);
      expect(count).to.eql(1);

      // NB: multiple calls only initialize once.
      const res2 = res1.state.init().state.init().state.init();
      expect(count).to.eql(1);
      expect(res2).to.equal(root);
      expect(root.state.ready).to.eql(true);
      expect(root.state.tests).to.eql([test]);
      expect(root.state.children).to.eql([]);
    });

    it('child suite (deep)', () => {
      const children: t.TestSuiteModel[] = [];

      const root = TestSuite.describe('root', (e) => {
        const child1 = e.describe('child-1', (e) => {
          const child2 = e.describe('child-2');
          children.push(child2);
        });
        children.push(child1);
      });

      expect(root.state.children).to.eql([]);
      expect(children).to.eql([]);

      root.state.init();

      const child1 = children[0];
      const child2 = children[1];

      expect(root.state.ready).to.eql(true);
      expect(root.state.children).to.eql([child1]);

      expect(child1.state.ready).to.eql(true);
      expect(child2.state.ready).to.eql(true);
    });

    it('define: it.skip | it.only', () => {
      const root = TestSuite.describe('root', (e) => {
        e.it('foo-1');
        e.it.skip('foo-2');
        e.describe('child', (e) => {
          e.it.only('bar');
        });
      });

      root.state.init();
      const state = root.state;

      expect(state.tests[0].description).to.eql('foo-1');
      expect(state.tests[1].description).to.eql('foo-2');

      expect(state.tests[0].modifier).to.eql(undefined);
      expect(state.tests[1].modifier).to.eql('skip');

      const child = state.children[0].state;
      expect(child.tests[0].description).to.eql('bar');
      expect(child.tests[0].modifier).to.eql('only');
    });

    it('define: describe.skip | describe.only', () => {
      const root = TestSuite.describe('root', (e) => {
        e.describe.skip('child-1');
        e.describe.only('child-2');
      });

      root.state.init();

      expect(root.state.modifier).to.eql(undefined);
      expect(root.state.children[0].state.modifier).to.eql('skip');
      expect(root.state.children[1].state.modifier).to.eql('only');
    });
  });

  describe('run', () => {
    it('sync', async () => {
      let count = 0;
      const root = TestSuite.describe('root', (e) => {
        e.it('foo', () => count++);
      });
      const res = await root.run();
      expect(res.ok).to.eql(true);
      expect(count).to.eql(1);
    });

    it('async', async () => {
      let count = 0;
      const root = TestSuite.describe('root', (e) => {
        e.it('foo', async () => {
          await time.wait(20);
          count++;
        });
      });
      const res = await root.run();
      expect(count).to.eql(1);
      expect(res.ok).to.eql(true);
      expect(res.elapsed).to.greaterThan(19);
    });

    it('no tests', async () => {
      const root = TestSuite.describe('root', (e) => {});
      const res = await root.run();
      expect(res.ok).to.eql(true);
    });

    it('deep', async () => {
      let count = 0;

      const root = TestSuite.describe('root', (e) => {
        e.describe('child-1', (e) => {
          e.describe('child-2', (e) => {
            e.it('foo', () => count++);
          });
        });
      });

      const res = await root.run();
      expect(count).to.eql(1);
      expect(res.ok).to.eql(true);
      expect(res.tests).to.eql([]);
      expect(res.children[0].children[0].tests[0].ok).to.eql(true);
    });

    it('deep (suppressed by param)', async () => {
      let count = 0;
      const root = TestSuite.describe('root', (e) => {
        e.describe('child-1', (e) => {
          e.describe('child-2', (e) => {
            e.it('foo', () => count++);
          });
        });
      });

      const res = await root.run({ deep: false });
      expect(count).to.eql(0);
      expect(res.ok).to.eql(true);
    });

    it('test throws error', async () => {
      const root = TestSuite.describe('root', (e) => {
        e.it('foo', async () => {
          throw new Error('Fail');
        });
      });
      const res = await root.run();
      expect(res.ok).to.eql(false);
      expect(res.tests[0].error?.message).to.include('Fail');
    });

    it('test throws error (timeout, deep)', async () => {
      let count = 0;
      const root = TestSuite.describe('root', (e) => {
        e.it('test-1', () => count++);
        e.describe('child-1', (e) => {
          e.it('test-2', () => count++);
          e.describe('child-2', (e) => {
            e.it('test-3', async () => {
              await time.wait(30);
              count++;
            });
          });
        });
      });

      const res = await root.run({ timeout: 10 });

      expect(res.elapsed).to.greaterThan(10);
      expect(res.elapsed).to.lessThan(20);

      expect(count).to.eql(2); // NB: failing test never increments counter.
      expect(res.ok).to.eql(false);

      expect(res.tests[0].ok).to.eql(true);
      expect(res.children[0].ok).to.eql(false);
      expect(res.children[0].tests[0].ok).to.eql(true);
      expect(res.children[0].children[0].tests[0].ok).to.eql(false);
      expect(res.children[0].children[0].tests[0].error?.message).to.include('Timed out');
    });
  });
});
