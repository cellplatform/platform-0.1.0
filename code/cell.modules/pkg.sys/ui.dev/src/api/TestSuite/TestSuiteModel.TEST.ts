import { Test } from '.';
import { expect, t, time } from '../../test';
import { Is } from './common';
import { Constraints } from './helpers/Constraints';
import { Tree } from './helpers/Tree';
import { TestModel } from './TestModel';

describe('TestSuiteModel', () => {
  describe('model', () => {
    it('id: "TestSuite.<slug>"', () => {
      const model1 = Test.describe('foo');
      const model2 = Test.describe('foo');

      expect(model1.id.startsWith('TestSuite.')).to.eql(true);
      expect(model2.id.startsWith('TestSuite.')).to.eql(true);

      expect(model1.kind).to.eql('TestSuite');
      expect(model2.kind).to.eql('TestSuite');

      expect(model1).to.not.equal(model2); // NB: Different instance.
    });

    it('Is.suite', () => {
      const test = (input: any, expected: boolean) => {
        expect(Is.suite(input)).to.eql(expected);
      };

      test(undefined, false);
      test(null, false);
      test('', false);
      test(true, false);
      test(123, false);
      test([123], false);
      test({}, false);
      test(TestModel({ parent: Test.describe('foo'), description: 'name' }), false);

      test('TestSuite.1234', true);
      test(Test.describe('foo'), true);
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
      await root1.init();
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

      const res1 = await root.init();
      expect(res1).to.equal(root);
      expect(root.state.ready).to.eql(true);
      expect(count).to.eql(1);

      // NB: multiple calls only initialize once.
      const res2 = await res1.init();
      expect(count).to.eql(1);
      expect(res2).to.equal(root);
      expect(root.state.ready).to.eql(true);
      expect(root.state.tests).to.eql([test]);
      expect(root.state.children).to.eql([]);
    });

    it('parent refs', async () => {
      const root = Test.describe('root', (e) => {
        e.describe('child-1', (e) => {
          e.describe('child-2');
        });
      });

      await root.init();
      const child1 = root.state.children[0];
      const child2 = child1.state.children[0];

      expect(root.state.parent).to.equal(undefined);
      expect(child1.state.parent).to.equal(root);
      expect(child2.state.parent).to.equal(child1);
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
      await root.init();
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

      await root.init();

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

      await root.init();
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

      await root.init();

      expect(root.state.modifier).to.eql(undefined);
      expect(root.state.children[0].state.modifier).to.eql('skip');
      expect(root.state.children[1].state.modifier).to.eql('only');
    });

    it('define (root): Test.describe.skip | Test.describe.only', async () => {
      const root1 = Test.describe('root');
      const root2 = Test.describe.skip('root');
      const root3 = Test.describe.only('root');

      await root1.init();
      await root2.init();
      await root3.init();

      expect(root1.state.modifier).to.eql(undefined);
      expect(root2.state.modifier).to.eql('skip');
      expect(root3.state.modifier).to.eql('only');
    });

    it('clone', async () => {
      const root1 = Test.describe('root', (e) => {
        e.describe('child-1', (e) => {
          e.it('hello');
        });
      });

      const root2 = await root1.clone();

      // Differnt instances.
      expect(root1).to.not.equal(root2);
      expect(root1.state).to.not.equal(root2.state);
      expect(root1.state.children[0]).to.not.equal(root2.state.children[0]);
      expect(root1.state.children[0].state.tests[0]).to.not.equal(
        root2.state.children[0].state.tests[0],
      );

      // Equivalent objects.
      expect(root1).to.eql(root2);
      expect(root1.state).to.eql(root2.state);
      expect(root1.state.children[0]).to.eql(root2.state.children[0]);
      expect(root1.state.children[0].state.tests[0]).to.eql(root2.state.children[0].state.tests[0]);
    });
  });

  describe('run', () => {
    it('sync', async () => {
      let count = 0;
      const root = Test.describe('root', (e) => {
        e.it('foo', () => count++);
      });
      const res = await root.run();

      expect(res.id).to.eql(root.id);
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

      expect(res.id).to.eql(root.id);
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

    describe('excluded', () => {
      it('excluded: it.skip', async () => {
        let count = 0;
        const root = Test.describe('root', (e) => {
          e.it('one', () => count++);
          e.it.skip('two', () => count++);
        });

        const res = await root.run();

        expect(count).to.eql(1);
        expect(res.tests[0].excluded).to.eql(undefined);
        expect(res.tests[1].excluded).to.eql(['skip']);
      });

      it('excluded: it.only', async () => {
        const list: string[] = [];
        const root = Test.describe('root', (e) => {
          e.it('1', (e) => list.push('1'));
          e.describe('2', (e) => {
            e.it('2.1', (e) => list.push('2.1'));
            e.it.only('2.2', (e) => list.push('2.2'));
            e.it.skip('2.3', (e) => list.push('2.3'));
          });
        });

        const res = await root.run();

        expect(list).to.eql(['2.2']);
        expect(res.tests[0].excluded).to.eql(['only']);
        expect(res.children[0].tests[0].excluded).to.eql(['only']);
        expect(res.children[0].tests[1].excluded).to.eql(undefined);
        expect(res.children[0].tests[2].excluded).to.eql(['skip', 'only']);
      });

      it('excluded: describe.only', async () => {
        const list: string[] = [];
        const root = Test.describe('root', (e) => {
          e.it('1', (e) => list.push('1'));
          e.describe.only('2', (e) => {
            e.it('2.1', () => list.push('2.1'));
            e.it.skip('2.2', () => list.push('2.2'));
            e.it('2.3', () => list.push('2.3'));
          });
        });

        const res = await root.run();

        expect(list).to.eql(['2.1', '2.3']);
        expect(res.tests[0].excluded).to.eql(['only']);
        expect(res.children[0].tests[0].excluded).to.eql(undefined);
        expect(res.children[0].tests[1].excluded).to.eql(['skip', 'only']);
        expect(res.children[0].tests[2].excluded).to.eql(undefined);
      });

      it('excluded: describe.only => it.only', async () => {
        const list: string[] = [];
        const root = Test.describe('root', (e) => {
          e.it('1', () => list.push('1'));
          e.describe.only('2', (e) => {
            e.it('2.1', () => list.push('2.1'));
            e.it('2.2', () => list.push('2.2'));
            e.it.only('2.3', () => list.push('2.3'));
          });
          e.it.only('3', () => list.push('3'));
        });

        await root.run();
        expect(list).to.eql(['3', '2.3']);
      });

      it('excluded: bundled suite set', async () => {
        const list: string[] = [];
        const root1 = Test.describe('1', (e) => {
          e.it('1.1', (e) => list.push('1.1'));
        });
        const root2 = Test.describe('2', (e) => {
          e.it.only('2.1', (e) => list.push('2.1'));
        });

        const bundle = await Test.bundle([root1, root2]);
        await bundle.run();

        expect(list).to.eql(['2.1']);
      });
    });

    describe('error', () => {
      it('error: test throws error', async () => {
        const root = Test.describe('root', (e) => {
          e.it('foo', async () => {
            throw new Error('Fail');
          });
        });
        const res = await root.run();
        expect(res.ok).to.eql(false);
        expect(res.tests[0].error?.message).to.include('Fail');
      });

      it('error: test throws error (timeout, deep)', async () => {
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

      expect(child1.state.parent?.id).to.eql(root.id);
      expect(child2.state.parent?.id).to.eql(root.id);
      expect(child3.state.parent?.id).to.eql(root.id);
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
      expect(root.state.description).to.eql('Tests');
    });

    it('TestSuite {objects}', async () => {
      const child1 = Test.describe('child-1');
      const child2 = Test.describe('child-2');

      const root = await Test.bundle([child1, child2]);
      const children = root.state.children;

      expect(children.length).to.eql(2);
      expect(children[0].id).to.eql(child1.id);
      expect(children[1].id).to.eql(child2.id);

      expect(child1.state.parent?.id).to.eql(root.id);
      expect(child2.state.parent?.id).to.eql(root.id);
    });

    it('dynamic imports("...")', async () => {
      const child1 = import('./test.samples/One.TEST');
      const child2 = import('./test.samples/Two.TEST');

      const root = await Test.bundle([child1, child2]);
      const children = root.state.children;

      expect(children.length).to.eql(2);
      expect(children[0].state.description).to.eql('One');
      expect(children[1].state.description).to.eql('Two');

      expect(children[0].state.parent?.id).to.eql(root.id);
      expect(children[0].state.parent?.id).to.eql(root.id);
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

    it('mixed import (dynamic/static) with explicit root "description"', async () => {
      const child1 = Test.describe('One');
      const child2 = import('./test.samples/Two.TEST');

      const root = await Test.bundle('MySuite', [child1, child2]);
      const children = root.state.children;

      expect(root.state.description).to.eql('MySuite');
      expect(children.length).to.eql(2);
      expect(children[0].state.description).to.eql('One');
      expect(children[1].state.description).to.eql('Two');
    });

    it('single item bundle (no array)', async () => {
      const child1 = Test.describe('One');
      const child2 = import('./test.samples/Two.TEST');

      const root1 = await Test.bundle(child1);
      const root2 = await Test.bundle(child2);
      const root3 = await Test.bundle('MySuite-1', child1);
      const root4 = await Test.bundle('MySuite-2', child2);

      expect(root1.state.description).to.eql(child1.state.description); // NB: Root name taken from single bundle.
      expect(root2.state.description).to.eql((await child2).default.state.description); // NB: Root name taken from single bundle.
      expect(root3.state.description).to.eql('MySuite-1'); // NB: Custom name.
      expect(root4.state.description).to.eql('MySuite-2');
    });
  });
});
