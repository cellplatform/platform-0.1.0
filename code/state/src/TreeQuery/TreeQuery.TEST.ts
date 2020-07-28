import { expect, t } from '../test';
import { TreeQuery } from '.';

const create = TreeQuery.create;

type N = t.ITreeNode;

describe('TreeQuery', () => {
  describe('create', () => {
    it('with root (default node type)', () => {
      const root: N = { id: 'root' };
      const query = create(root);
      expect(query.root).to.equal(root);
      expect(query.namespace).to.eql('');
    });

    it('with root (specific node type)', () => {
      type T = N & { count: number };
      const root: T = { id: 'root', count: 0 };
      const query = create<T>(root);
      expect(query.root).to.equal(root);
      expect(query.namespace).to.eql('');
    });

    it('with namespace', () => {
      const test = (namespace: string | undefined, expected: string) => {
        const root: N = { id: 'root' };
        const query = create({ root, namespace });
        expect(query.namespace).to.eql(expected);
      };
      test('', '');
      test('  ', '');
      test('foo', 'foo');
      test('  foo  ', 'foo');
    });
  });

  describe('children (static)', () => {
    it('no arguments', () => {
      let count = 0;
      const res = TreeQuery.children(undefined, () => count++);

      expect(res).to.eql([]);
      expect(count).to.eql(1);
    });

    it('no childen => empty array (and assigns by default)', () => {
      const node: N = { id: 'root' };
      expect(node.children).to.eql(undefined);

      const res = TreeQuery.children(node);

      expect(res).to.eql([]);
      expect(node.children).to.equal(res);
    });

    it('no childen => empty array (and does not assign)', () => {
      const node: N = { id: 'root' };
      expect(node.children).to.eql(undefined);

      const res1 = TreeQuery.children(node, { assign: false });
      expect(res1).to.eql([]);
      expect(node.children).to.equal(undefined);

      const res2 = TreeQuery.children(node, undefined, { assign: false });
      expect(res2).to.eql([]);
      expect(node.children).to.equal(undefined);
    });

    it('returns child array (instance)', () => {
      const node = { id: 'root', children: [{ id: 'child' }] };
      expect(TreeQuery.children(node)).to.eql([{ id: 'child' }]);
    });

    it('runs visitor function', () => {
      const node = { id: 'root', children: [{ id: 'child-1' }, { id: 'child-2' }] };

      const visits: N[] = [];
      TreeQuery.children(node, (children) => children.forEach((child) => visits.push(child)));

      expect(visits.map((c) => c.id)).to.eql(['child-1', 'child-2']);
    });
  });

  describe('hasChild (static)', () => {
    const root = { id: 'A', children: [{ id: 'B' }, { id: 'C' }] };

    it('does have child', () => {
      expect(TreeQuery.hasChild(root, 'B')).to.eql(true);
      expect(TreeQuery.hasChild(root, 'C')).to.eql(true);
      expect(TreeQuery.hasChild(root, { id: 'C' })).to.eql(true);
    });

    it('does not have child', () => {
      expect(TreeQuery.hasChild(root, 'A')).to.eql(false);
      expect(TreeQuery.hasChild(root, 'NO_MATCH')).to.eql(false);
      expect(TreeQuery.hasChild(root, undefined)).to.eql(false);
      expect(TreeQuery.hasChild(undefined, undefined)).to.eql(false);
    });
  });

  describe('walkDown', () => {
    it('walkDown from root', () => {
      const tree: N = {
        id: 'root',
        children: [{ id: 'child-1' }, { id: 'child-2' }],
      };
      const query = create(tree);
      const items: t.ITreeDescend[] = [];
      query.walkDown((e) => items.push(e));

      expect(items.length).to.eql(3);
      expect(items[0].node).to.equal(tree);
      expect(items[1].node).to.equal(tree.children && tree.children[0]);
      expect(items[2].node).to.equal(tree.children && tree.children[1]);
      expect(items.every((m) => m.namespace === '')).to.eql(true);
    });

    it('walkDown from root (with namespace)', () => {
      const tree: N = {
        id: 'ns:root',
        children: [{ id: 'ns:child-1' }, { id: 'ns:child-2' }],
      };
      const query = create(tree);
      const items: t.ITreeDescend[] = [];
      query.walkDown((e) => items.push(e));

      expect(items.length).to.eql(3);
      expect(items.every((m) => m.namespace === 'ns')).to.eql(true);

      expect(items[0].id).to.equal('root');
      expect(items[0].node.id).to.equal('ns:root');

      expect(items[1].id).to.equal('child-1');
      expect(items[1].node.id).to.equal('ns:child-1');

      expect(items[2].id).to.equal('child-2');
      expect(items[2].node.id).to.equal('ns:child-2');
    });

    it('walkDown: skip (children)', () => {
      const tree: N = {
        id: 'root',
        children: [
          { id: 'child-1', children: [{ id: 'child-1.1' }, { id: 'child-1.1' }] },
          { id: 'child-2' },
        ],
      };
      const query = create(tree);

      const nodes: N[] = [];
      query.walkDown((e) => {
        nodes.push(e.node);
        if (e.node.id === 'child-1') {
          e.skip();
        }
      });

      expect(nodes.length).to.eql(3);
      expect(nodes[0].id).to.eql('root');
      expect(nodes[1].id).to.eql('child-1');
      expect(nodes[2].id).to.eql('child-2');
    });

    it('walkDown: stop mid-way', () => {
      const root: N = {
        id: 'root',
        children: [{ id: 'child-1' }, { id: 'child-2', children: [{ id: 'child-2.1' }] }],
      };

      const state = create(root);

      const walked: t.ITreeDescend<N>[] = [];
      state.walkDown((e) => {
        walked.push(e);
        if (e.id === 'child-1') {
          e.stop();
        }
      });

      expect(walked.length).to.eql(2);
      expect(walked[0].id).to.eql('root');
      expect(walked[1].id).to.eql('child-1');
    });

    it('walkDown: passes level/parent to visitor', () => {
      const grandchild: N = { id: 'grandchild' };
      const child: N = { id: 'child', children: [grandchild] };
      const root: N = { id: 'root', children: [child] };
      const query = create(root);

      const items: t.ITreeDescend[] = [];
      query.walkDown((e) => items.push(e));

      expect(items.length).to.eql(3);

      expect(items[0].level).to.eql(0);
      expect(items[1].level).to.eql(1);
      expect(items[2].level).to.eql(2);

      expect(items[0].parent).to.eql(undefined);
      expect(items[1].parent).to.eql(root);
      expect(items[2].parent).to.eql(child);
    });

    it('walkDown: passes index to visitor (sibling position)', () => {
      const root: N = {
        id: 'root',
        children: [{ id: 'child-1' }, { id: 'child-2' }],
      };
      const query = create(root);

      const items: t.ITreeDescend[] = [];
      query.walkDown((e) => items.push(e));

      expect(items[0].index).to.eql(-1);
      expect(items[1].index).to.eql(0);
      expect(items[2].index).to.eql(1);
    });

    it('walkDown: does not walk down into child namespace', () => {
      const root: N = {
        id: 'ns1:root',
        children: [{ id: 'ns1:child-1' }, { id: 'ns1:child-2', children: [{ id: 'ns2:foo' }] }],
      };

      const query = create({ root, namespace: 'ns1' });
      expect(query.namespace).to.eql('ns1');

      // Verify: Can be round within the root data-structure using an unnamespaced search.
      expect(create(root).findById('ns2:foo')?.id).to.eql('ns2:foo');

      const walked: t.ITreeDescend<N>[] = [];
      query.walkDown((e) => walked.push(e));

      const ids = walked.map((e) => e.id);
      expect(ids.length).to.eql(3);
      expect(ids.includes('ns2:foo')).to.eql(false);
    });
  });

  describe('walkUp', () => {
    it('walkUp: to root', () => {
      const tree: N = {
        id: 'root',
        children: [{ id: 'child-1' }, { id: 'child-2', children: [{ id: 'grandchild-1' }] }],
      };

      const query = create(tree);
      const start = query.findById('grandchild-1');

      const items: t.ITreeAscend[] = [];
      query.walkUp(start, (e) => items.push(e));

      expect(items.length).to.eql(3);
      expect(items.map((e) => e.node.id)).to.eql(['grandchild-1', 'child-2', 'root']);
      expect(items.every((m) => m.namespace === '')).to.eql(true);

      expect(items[0].parent && items[0].parent.id).to.eql('child-2');
      expect(items[1].parent && items[1].parent.id).to.eql('root');
      expect(items[2].parent && items[2].parent.id).to.eql(undefined);

      expect(items[0].index).to.eql(0);
      expect(items[1].index).to.eql(1);
      expect(items[2].index).to.eql(-1);
    });

    it('walkUp: to root (with namespace)', () => {
      const tree: N = {
        id: 'ns:root',
        children: [
          { id: 'ns:child-1' },
          { id: 'ns:child-2', children: [{ id: 'ns:grandchild-1' }] },
        ],
      };
      const query = create(tree);
      const start = query.findById('ns:grandchild-1');

      const items: t.ITreeAscend[] = [];
      query.walkUp(start, (e) => items.push(e));

      expect(items.length).to.eql(3);
      expect(items.every((m) => m.namespace === 'ns')).to.eql(true);
      expect(items.map((e) => e.id)).to.eql(['grandchild-1', 'child-2', 'root']);
      expect(items.map((e) => e.node.id)).to.eql(['ns:grandchild-1', 'ns:child-2', 'ns:root']);
    });

    it('walkUp: stop mid-way', () => {
      const tree: N = {
        id: 'root',
        children: [{ id: 'child-1' }, { id: 'child-2', children: [{ id: 'grandchild-1' }] }],
      };

      const query = create(tree);
      const start = query.findById('grandchild-1');
      const list: t.ITreeAscend[] = [];
      query.walkUp(start, (e) => {
        list.push(e);
        if (e.node.id === 'child-2') {
          e.stop();
        }
      });

      expect(list.length).to.eql(2);
      expect(list.map((e) => e.id)).to.eql(['grandchild-1', 'child-2']);
    });

    it('walkUp: startAt not found', () => {
      const tree: N = {
        id: 'root',
        children: [{ id: 'child-1' }, { id: 'child-2', children: [{ id: 'grandchild-1' }] }],
      };
      const query = create(tree);

      const test = (startAt?: N | string) => {
        const walked: t.ITreeAscend<N>[] = [];
        query.walkUp(startAt, (e) => walked.push(e));
        expect(walked).to.eql([]);
      };

      test();
      test('404');
      test({ id: '404' });
    });

    it('walkUp: passes level (from start of ascent)', () => {
      const tree: N = {
        id: 'root',
        children: [{ id: 'child-1' }, { id: 'child-2', children: [{ id: 'grandchild-1' }] }],
      };

      const query = create(tree);
      const walked: t.ITreeAscend<N>[] = [];
      query.walkUp('grandchild-1', (e) => walked.push(e));

      expect(walked.map((e) => e.level)).to.eql([0, 1, 2]);
    });

    it('walkUp: does not walk up into parent namespace', () => {
      const tree: N = {
        id: 'ns1:root',
        children: [
          { id: 'ns1:child-1' },
          { id: 'ns2:child-2', children: [{ id: 'ns2:child-2.1' }] },
        ],
      };

      const root = create(tree).findById('ns2:child-2') as N;
      const child = create(tree).findById('ns2:child-2.1') as N;
      expect(child).to.exist;

      const query = create({ root, namespace: 'ns2' });
      const test = (startAt?: string | N) => {
        const walked: t.ITreeAscend<N>[] = [];
        query.walkUp(startAt, (e) => walked.push(e));
        expect(walked.map((e) => e.id)).to.eql(['child-2.1', 'child-2']);
      };

      test(child);
      test(child?.id);
      test('child-2.1');
    });
  });

  describe('find', () => {
    it('no namespace', () => {
      const tree: N = {
        id: 'root',
        children: [{ id: 'child-1' }, { id: 'child-2', children: [{ id: 'child-3' }] }],
      };

      const query = create(tree);
      const res1 = query.find((e) => e.node.id === 'child-3');
      const res2 = query.find((e) => e.node.id === 'NO_EXIT');

      expect(res1).to.eql({ id: 'child-3' });
      expect(res2).to.eql(undefined);
    });
  });

  describe('findById', () => {
    it('no namespace', () => {
      const tree: N = {
        id: 'root',
        children: [{ id: 'child-1' }, { id: 'child-2', children: [{ id: 'child-3' }] }],
      };

      const query = create(tree);
      const res1 = query.findById('child-3');
      const res2 = query.findById('NO_EXIST');
      const res3 = query.findById(undefined);
      const res4 = query.findById({ id: 'child-2' });

      expect(res1).to.eql({ id: 'child-3' });
      expect(res2).to.eql(undefined);
      expect(res3).to.eql(undefined);
      expect(res4).to.eql({ id: 'child-2', children: [{ id: 'child-3' }] });
    });

    it('within namespace', () => {
      const root: N = {
        id: 'ns1:root',
        children: [{ id: 'ns1:child-1' }, { id: 'ns2:child-2' }, { id: 'foo' }],
      };

      const query = create({ root });
      const ns1 = create({ root, namespace: 'ns1' });

      // No namespace (anything can be found).
      expect(query.findById('root')?.id).to.eql('ns1:root'); // No ns - match on id only
      expect(query.findById('foo:root')).to.eql(undefined); // ns does not match
      expect(query.findById('ns1:root')?.id).to.eql('ns1:root');
      expect(query.findById('ns1:child-1')?.id).to.eql('ns1:child-1');
      expect(query.findById('ns2:child-2')?.id).to.eql('ns2:child-2');
      expect(query.findById('foo')?.id).to.eql('foo');

      // Look within namespaced query.
      expect(ns1.findById('root')?.id).to.eql('ns1:root');
      expect(ns1.findById('ns1:root')?.id).to.eql('ns1:root');
      expect(ns1.findById('foo:root')).to.eql(undefined);
      expect(ns1.findById('404')).to.eql(undefined);
      expect(ns1.findById('ns1:404')).to.eql(undefined);

      expect(ns1.findById('child-1')?.id).to.eql('ns1:child-1');
      expect(ns1.findById('ns1:child-1')?.id).to.eql('ns1:child-1');

      // Not in namespace.
      expect(ns1.findById('child-2')).to.eql(undefined);
      expect(ns1.findById('ns2:child-2')).to.eql(undefined);
      expect(ns1.findById('foo')).to.eql(undefined);
    });
  });

  describe('parent', () => {
    it('has a parent', () => {
      const grandchild: N = { id: 'grandchild' };
      const child: N = { id: 'child', children: [grandchild] };
      const root: N = { id: 'root', children: [child] };
      const query = create(root);

      expect(query.parent(child)).to.equal(root);
      expect(query.parent(grandchild)).to.equal(child);
    });

    it('has no parent', () => {
      const grandchild: N = { id: 'grandchild' };
      const child: N = { id: 'child', children: [grandchild] };
      const root: N = { id: 'root', children: [] };
      const query = create(root);

      expect(query.parent(child)).to.equal(undefined);
      expect(query.parent(grandchild)).to.equal(undefined);
    });
  });

  describe('ancestor', () => {
    const tree: t.ITreeNode = {
      id: 'root',
      children: [{ id: 'child-1' }, { id: 'child-2', children: [{ id: 'child-3' }] }],
    };

    it('matches self (first)', () => {
      const query = create(tree);
      const node = query.findById('child-3');
      const res = query.ancestor(node, (e) => e.node.id === 'child-3');
      expect(res && res.id).to.eql('child-3');
    });

    it('finds matching ancestor', () => {
      const query = create(tree);
      const node = query.findById('child-3');
      const res1 = query.ancestor(node, (e) => e.node.id === 'child-2');
      const res2 = query.ancestor(node, (e) => e.node.id === 'root');
      expect(res1 && res1.id).to.eql('child-2');
      expect(res2 && res2.id).to.eql('root');
    });

    it('no match', () => {
      const query = create(tree);
      const node = query.findById('root');
      const res = query.ancestor(node, (e) => e.node.id === 'child-1');
      expect(res).to.eql(undefined);
    });
  });

  describe('depth', () => {
    const root = {
      id: 'A',
      children: [{ id: 'B' }, { id: 'C', children: [{ id: 'D' }] }],
    };

    it('retrieves depth', () => {
      const query = create<N>(root);
      expect(query.depth('A')).to.eql(0);
      expect(query.depth({ id: 'A' })).to.eql(0);
      expect(query.depth('B')).to.eql(1);
      expect(query.depth('C')).to.eql(1);
      expect(query.depth('D')).to.eql(2);
      expect(query.depth({ id: 'D' })).to.eql(2);
    });

    it('-1', () => {
      const query = create<N>({ id: 'root' });
      expect(query.depth('C')).to.eql(-1);
      expect(query.depth(undefined)).to.eql(-1);
      expect(query.depth('NO_EXIST')).to.eql(-1);
      expect(query.depth({ id: 'NO_EXIST' })).to.eql(-1);
    });
  });

  describe('exists', () => {
    const tree: N = {
      id: 'root',
      children: [{ id: 'child-1' }, { id: 'child-2', children: [{ id: 'child-3' }] }],
    };

    it('exists', () => {
      const query = create(tree);

      expect(query.exists('root')).to.eql(true);
      expect(query.exists('child-3')).to.eql(true);

      expect(query.exists({ id: 'root' })).to.eql(true);
      expect(query.exists({ id: 'child-3' })).to.eql(true);

      expect(query.exists((e) => e.id === 'child-3')).to.eql(true);
    });

    it('does not exist', () => {
      const query = create(tree);
      expect(query.exists('404')).to.eql(false);
      expect(query.exists({ id: '404' })).to.eql(false);
      expect(query.exists((e) => e.id === '404')).to.eql(false);
    });
  });
});
