import { t, time, expect } from '../../test';
import { Test } from '.';

describe('TestSuite', () => {
  describe('model', () => {
    it('id: "TestSuite.<slug>"', () => {
      const model1 = Test.describe('foo');
      const model2 = Test.describe('foo');

      expect(model1.id.startsWith('TestSuite.')).to.eql(true);
      expect(model2.id.startsWith('TestSuite.')).to.eql(true);

      expect(model1).to.not.equal(model2); // NB: Different instance.
    });

    it('empty (no handler)', () => {
      const root = Test.describe('root');
      expect(root.state.description).to.eql('root');
      expect(root.state.children).to.eql([]);
      expect(root.state.tests).to.eql([]);
      expect(root.state.ready).to.eql(false);
      expect(root.state.modifier).to.eql(undefined);
    });

    it('handler (not initialized)', () => {
      const handler: t.TestSuiteHandler = (e) => null;
      const root = Test.describe('root', handler);
      expect(root.state.ready).to.eql(false);
    });

    it('timeout', async () => {
      const children: t.TestSuiteModel[] = [];

      const root1 = Test.describe('root-1', (e) => {
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
      await root1.state.init();
      const root2 = children[0];
      const root3 = children[1];

      expect(root1.state.timeout).to.eql(undefined);
      expect(root2.state.timeout).to.eql(0); // NB: clamped.
      expect(root3.state.timeout).to.eql(5000);
    });

    it('init (single test)', async () => {
      let test: t.TestModel | undefined = undefined;
      let count = 0;
      const handler: t.TestHandler = () => null;

      const root = Test.describe('root', (e) => {
        count++;
        test = e.it('foo', handler);
      });

      expect(root.state.description).to.eql('root');
      expect(root.state.ready).to.eql(false);
      expect(count).to.eql(0);

      const res1 = await root.state.init();
      expect(res1).to.equal(root);
      expect(root.state.ready).to.eql(true);
      expect(count).to.eql(1);

      // NB: multiple calls only initialize once.
      const res2 = await res1.state.init();
      expect(count).to.eql(1);
      expect(res2).to.equal(root);
      expect(root.state.ready).to.eql(true);
      expect(root.state.tests).to.eql([test]);
      expect(root.state.children).to.eql([]);
    });

    it('init (async suite setup)', async () => {
      let count = 0;
      const root = Test.describe('root', async (e) => {
        await time.wait(10);
        e.describe('child', async () => {
          await time.wait(10);
          count++;
        });
        count++;
      });

      expect(count).to.eql(0);
      await root.state.init();
      expect(count).to.eql(2);
    });

    it('child suite (deep)', async () => {
      const children: t.TestSuiteModel[] = [];

      const root = Test.describe('root', (e) => {
        const child1 = e.describe('child-1', (e) => {
          const child2 = e.describe('child-2');
          children.push(child2);
        });
        children.push(child1);
      });

      expect(root.state.children).to.eql([]);
      expect(children).to.eql([]);

      await root.state.init();

      const child1 = children[0];
      const child2 = children[1];

      expect(root.state.ready).to.eql(true);
      expect(root.state.children).to.eql([child1]);

      expect(child1.state.ready).to.eql(true);
      expect(child2.state.ready).to.eql(true);
    });

    it('define: it.skip | it.only', async () => {
      const root = Test.describe('root', (e) => {
        e.it('foo-1');
        e.it.skip('foo-2');
        e.describe('child', (e) => {
          e.it.only('bar');
        });
      });

      await root.state.init();
      const state = root.state;

      expect(state.tests[0].description).to.eql('foo-1');
      expect(state.tests[1].description).to.eql('foo-2');

      expect(state.tests[0].modifier).to.eql(undefined);
      expect(state.tests[1].modifier).to.eql('skip');

      const child = state.children[0].state;
      expect(child.tests[0].description).to.eql('bar');
      expect(child.tests[0].modifier).to.eql('only');
    });

    it('define: describe.skip | describe.only', async () => {
      const root = Test.describe('root', (e) => {
        e.describe.skip('child-1');
        e.describe.only('child-2');
      });

      await root.state.init();

      expect(root.state.modifier).to.eql(undefined);
      expect(root.state.children[0].state.modifier).to.eql('skip');
      expect(root.state.children[1].state.modifier).to.eql('only');
    });

    it('define (root): Test.describe.skip | Test.describe.only', async () => {
      const root1 = Test.describe('root');
      const root2 = Test.describe.skip('root');
      const root3 = Test.describe.only('root');

      await root1.state.init();
      await root2.state.init();
      await root3.state.init();

      expect(root1.state.modifier).to.eql(undefined);
      expect(root2.state.modifier).to.eql('skip');
      expect(root3.state.modifier).to.eql('only');
    });
  });

  describe('run', () => {
    it('sync', async () => {
      let count = 0;
      const root = Test.describe('root', (e) => {
        e.it('foo', () => count++);
      });
      const res = await root.run();
      expect(res.ok).to.eql(true);
      expect(count).to.eql(1);
    });

    it('async', async () => {
      let count = 0;
      const root = Test.describe('root', (e) => {
        e.it('foo', async () => {
          await time.wait(20);
          count++;
        });
      });
      const res = await root.run();
      expect(count).to.eql(1);
      expect(res.ok).to.eql(true);
      expect(res.elapsed).to.greaterThan(18);
    });

    it('no tests', async () => {
      const root = Test.describe('root', (e) => null);
      const res = await root.run();
      expect(res.ok).to.eql(true);
    });

    it('deep', async () => {
      let count = 0;

      const root = Test.describe('root', (e) => {
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

    it('not deep (suppressed by param)', async () => {
      let count = 0;
      const root = Test.describe('root', (e) => {
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
      const root = Test.describe('root', (e) => {
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
      const root = Test.describe('root', (e) => {
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

      expect(res.elapsed).to.greaterThan(9);
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

  describe('merge', () => {
    it('merges', () => {
      const root = Test.describe('root');
      const child1 = Test.describe('child-1');
      const child2 = Test.describe('child-2');
      const child3 = Test.describe('child-3');

      expect(root.state.children).to.eql([]);

      root.merge(child1);
      expect(root.state.children).to.eql([child1]);

      root.merge(child2, child3);
      expect(root.state.children).to.eql([child1, child2, child3]);
    });

    it('does not duplicate', () => {
      const root = Test.describe('root');
      const child = Test.describe('child');
      expect(root.state.children).to.eql([]);

      root.merge(child, child, child);
      expect(root.state.children).to.eql([child]);

      root.merge(child);
      root.merge(child);
      root.merge(child);
      expect(root.state.children).to.eql([child]);
    });
  });

  describe('Test.bundle', () => {
    it('nothing [<empty>]', async () => {
      const root = await Test.bundle([]);
      expect(root.state.children).to.eql([]);
    });

    it('TestSuite objects', async () => {
      const child1 = Test.describe('child-1');
      const child2 = Test.describe('child-2');

      const root = await Test.bundle([child1, child2]);
      const children = root.state.children;

      expect(children.length).to.eql(2);
      expect(children[0].id).to.eql(child1.id);
      expect(children[1].id).to.eql(child2.id);
    });

    it('dynamic imports', async () => {
      const one = import('./test.samples/One.TEST');
      const two = import('./test.samples/Two.TEST');

      const root = await Test.bundle([one, two]);
      const children = root.state.children;

      expect(children.length).to.eql(2);
      expect(children[0].state.description).to.eql('One');
      expect(children[1].state.description).to.eql('Two');
    });

    it('dynamic: with no export (ignore)', async () => {
      const root1 = await Test.bundle([import('./test.samples/NoExport.TEST')]);
      expect(root1.state.children).to.eql([]);

      const root2 = await Test.bundle([
        import('./test.samples/NoExport.TEST'), // NB: Will not merge anything (no default export)
        import('./test.samples/One.TEST'),
        import('./test.samples/Two.TEST'),
      ]);
      const children = root2.state.children;
      expect(children.length).to.eql(2);
      expect(children[0].state.description).to.eql('One');
      expect(children[1].state.description).to.eql('Two');
    });

    it('dynamic: default export not a test-suite (ignore)', async () => {
      const root = await Test.bundle([import('./test.samples/ExportNonSuite.TEST')]);
      expect(root.state.children).to.eql([]);
    });
  });
});
