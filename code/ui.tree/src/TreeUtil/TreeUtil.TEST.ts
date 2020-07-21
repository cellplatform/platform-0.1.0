import { expect, t } from '../test';

import { TreeUtil } from '.';

describe.only('TreeUtil', () => {
  describe('walkDown', () => {
    it('walks from root', () => {
      const tree: t.ITreeViewNode = {
        id: 'root',
        children: [{ id: 'child-1' }, { id: 'child-2' }],
      };

      const nodes: t.ITreeViewNode[] = [];
      TreeUtil.walkDown(tree, (e) => nodes.push(e.node));

      expect(nodes.length).to.eql(3);
      expect(nodes[0]).to.equal(tree);
      expect(nodes[1]).to.equal(tree.children && tree.children[0]);
      expect(nodes[2]).to.equal(tree.children && tree.children[1]);
    });

    it('skips walking children of descendent (`.skip`)', () => {
      const tree: t.ITreeViewNode = {
        id: 'root',
        children: [
          { id: 'child-1', children: [{ id: 'child-1.1' }, { id: 'child-1.1' }] },
          { id: 'child-2' },
        ],
      };

      const nodes: t.ITreeViewNode[] = [];
      TreeUtil.walkDown(tree, (e) => {
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

    it('passes parent as args', () => {
      const grandchild: t.ITreeViewNode = { id: 'grandchild' };
      const child: t.ITreeViewNode = { id: 'child', children: [grandchild] };
      const root: t.ITreeViewNode = { id: 'root', children: [child] };

      const items: t.ITreeDescend[] = [];
      TreeUtil.walkDown(root, (e) => items.push(e));

      expect(items.length).to.eql(3);

      expect(items[0].depth).to.eql(0);
      expect(items[1].depth).to.eql(1);
      expect(items[2].depth).to.eql(2);

      expect(items[0].parent).to.eql(undefined);
      expect(items[1].parent).to.eql(root);
      expect(items[2].parent).to.eql(child);
    });

    it('reports node index (sibling position)', () => {
      const tree: t.ITreeViewNode = {
        id: 'root',
        children: [{ id: 'child-1' }, { id: 'child-2' }],
      };

      const items: t.ITreeDescend[] = [];
      TreeUtil.walkDown(tree, (e) => items.push(e));

      expect(items[0].index).to.eql(-1);
      expect(items[1].index).to.eql(0);
      expect(items[2].index).to.eql(1);
    });
  });

  describe('walkUp', () => {
    const tree: t.ITreeViewNode = {
      id: 'root',
      children: [{ id: 'child-1' }, { id: 'child-2', children: [{ id: 'grandchild-1' }] }],
    };

    it('walks to root', () => {
      const start = TreeUtil.findById(tree, 'grandchild-1');

      const items: t.ITreeAscend[] = [];
      TreeUtil.walkUp(tree, start, (e) => items.push(e));

      expect(items.length).to.eql(3);
      expect(items.map((e) => e.node.id)).to.eql(['grandchild-1', 'child-2', 'root']);

      expect(items[0].parent && items[0].parent.id).to.eql('child-2');
      expect(items[1].parent && items[1].parent.id).to.eql('root');
      expect(items[2].parent && items[2].parent.id).to.eql(undefined);

      expect(items[0].index).to.eql(0);
      expect(items[1].index).to.eql(1);
      expect(items[2].index).to.eql(-1);
    });

    it('stops mid-way', () => {
      const start = TreeUtil.findById(tree, 'grandchild-1');
      const list: t.ITreeAscend[] = [];
      TreeUtil.walkUp(tree, start, (e) => {
        list.push(e);
        if (e.node.id === 'child-2') {
          e.stop();
        }
      });

      expect(list.length).to.eql(2);
      expect(list.map((e) => e.node.id)).to.eql(['grandchild-1', 'child-2']);
    });
  });

  describe('find', () => {
    const tree: t.ITreeViewNode = {
      id: 'root',
      children: [{ id: 'child-1' }, { id: 'child-2', children: [{ id: 'child-3' }] }],
    };

    it('finds the given node', () => {
      const res1 = TreeUtil.find(tree, (e) => e.node.id === 'child-3');
      const res2 = TreeUtil.find(tree, (e) => e.node.id === 'NO_EXIT');
      expect(res1).to.eql({ id: 'child-3' });
      expect(res2).to.eql(undefined);
    });

    it('finds the given node by ID', () => {
      const res1 = TreeUtil.findById(tree, 'child-3');
      const res2 = TreeUtil.findById(tree, 'NO_EXIST');
      const res3 = TreeUtil.findById(tree, undefined);
      const res4 = TreeUtil.findById(tree, { id: 'child-2' });
      expect(res1).to.eql({ id: 'child-3' });
      expect(res2).to.eql(undefined);
      expect(res3).to.eql(undefined);
      expect(res4).to.eql({ id: 'child-2', children: [{ id: 'child-3' }] });
    });
  });

  describe('ancestor', () => {
    const tree: t.ITreeViewNode = {
      id: 'root',
      children: [{ id: 'child-1' }, { id: 'child-2', children: [{ id: 'child-3' }] }],
    };

    it('matches self (first)', () => {
      const node = TreeUtil.findById(tree, 'child-3');
      const res = TreeUtil.ancestor(tree, node, (e) => e.node.id === 'child-3');
      expect(res && res.id).to.eql('child-3');
    });

    it('finds matching ancestor', () => {
      const node = TreeUtil.findById(tree, 'child-3');
      const res1 = TreeUtil.ancestor(tree, node, (e) => e.node.id === 'child-2');
      const res2 = TreeUtil.ancestor(tree, node, (e) => e.node.id === 'root');
      expect(res1 && res1.id).to.eql('child-2');
      expect(res2 && res2.id).to.eql('root');
    });

    it('no match', () => {
      const node = TreeUtil.findById(tree, 'root');
      const res = TreeUtil.ancestor(tree, node, (e) => e.node.id === 'child-1');
      expect(res).to.eql(undefined);
    });
  });

  describe('children', () => {
    it('no childen => empty array', () => {
      const node = { id: 'root' };
      expect(TreeUtil.children(node)).to.eql([]);
    });

    it('returns child array', () => {
      const node = { id: 'root', children: [{ id: 'child' }] };
      expect(TreeUtil.children(node)).to.eql([{ id: 'child' }]);
    });
  });

  describe('childAt', () => {
    const root = { id: 'A', children: [{ id: 'B' }, { id: 'C' }] };
    it('undefined', () => {
      expect(TreeUtil.childAt(0)).to.eql(undefined);
      expect(TreeUtil.childAt(2, root)).to.eql(undefined);
    });

    it('retrieves child', () => {
      expect(TreeUtil.childAt(0, root)).to.eql({ id: 'B' });
      expect(TreeUtil.childAt(1, root)).to.eql({ id: 'C' });
    });
  });

  describe('hasChild', () => {
    const root = { id: 'A', children: [{ id: 'B' }, { id: 'C' }] };
    it('does have child', () => {
      expect(TreeUtil.hasChild(root, 'B')).to.eql(true);
      expect(TreeUtil.hasChild(root, 'C')).to.eql(true);
      expect(TreeUtil.hasChild(root, { id: 'C' })).to.eql(true);
    });

    it('does not have child', () => {
      expect(TreeUtil.hasChild(root, 'A')).to.eql(false);
      expect(TreeUtil.hasChild(root, 'NO_MATCH')).to.eql(false);
      expect(TreeUtil.hasChild(root, undefined)).to.eql(false);
    });
  });

  describe('map', () => {
    const root = { id: 'A', children: [{ id: 'B' }, { id: 'C' }] };
    it('maps the entire tree', () => {
      const res = TreeUtil.map(root, (e) => e.node.id);
      expect(res).to.eql(['A', 'B', 'C']);
    });

    it('stops mapping mid-way through', () => {
      let count = 0;
      const res = TreeUtil.map(root, (e) => {
        count++;
        if (count > 1) {
          e.stop();
        }
        return e.node.id;
      });
      expect(res).to.eql(['A', 'B']);
    });
  });

  describe('depth', () => {
    const root = {
      id: 'A',
      children: [{ id: 'B' }, { id: 'C', children: [{ id: 'D' }] }],
    };

    it('retrieves depth', () => {
      expect(TreeUtil.depth(root, 'A')).to.eql(0);
      expect(TreeUtil.depth(root, { id: 'A' })).to.eql(0);
      expect(TreeUtil.depth(root, 'B')).to.eql(1);
      expect(TreeUtil.depth(root, 'C')).to.eql(1);
      expect(TreeUtil.depth(root, 'D')).to.eql(2);
      expect(TreeUtil.depth(root, { id: 'D' })).to.eql(2);
    });

    it('-1', () => {
      expect(TreeUtil.depth(undefined, 'C')).to.eql(-1);
      expect(TreeUtil.depth(root, undefined)).to.eql(-1);
      expect(TreeUtil.depth(root, 'NO_EXIST')).to.eql(-1);
      expect(TreeUtil.depth(root, { id: 'NO_EXIST' })).to.eql(-1);
    });
  });

  describe('replace', () => {
    it('replaces root', () => {
      const tree: t.ITreeViewNode = { id: 'root' };
      const res = TreeUtil.replace(tree, {
        id: 'root',
        props: { label: 'hello' },
      });
      expect(res && res.props).to.eql({ label: 'hello' });
    });

    it('replaces child', () => {
      const tree: t.ITreeViewNode = { id: 'root', children: [{ id: 'foo' }] };
      const res = TreeUtil.replace(tree, {
        id: 'foo',
        props: { label: 'hello' },
      });
      const children = TreeUtil.children(res);
      expect(res && res.id).to.eql('root');
      expect(children[0]).to.eql({ id: 'foo', props: { label: 'hello' } });
    });

    it('replaces grand-child', () => {
      const tree: t.ITreeViewNode = {
        id: 'root',
        children: [{ id: 'child', children: [{ id: 'grandchild' }] }],
      };
      const res = TreeUtil.replace(tree, {
        id: 'grandchild',
        props: { label: 'hello' },
      });
      expect(res && res.id).to.eql('root');

      const child = TreeUtil.childAt(0, res);
      const grandchild = TreeUtil.childAt(0, child);
      expect(child.id).to.eql('child');
      expect(grandchild.id).to.eql('grandchild');
    });
  });

  describe('replaceChild', () => {
    it('inserts the given child as clone (no starting children array)', () => {
      const root: t.ITreeViewNode = { id: 'root' };
      const child: t.ITreeViewNode = { id: 'child' };

      const res = TreeUtil.replaceChild(root, child);
      const children = res ? res.children || [] : [];

      expect(res).to.not.equal(root);
      expect(res && res.id).to.eql('root');
      expect(children).to.eql([{ id: 'child' }]);
      expect(children[0]).to.not.equal(child);
    });

    it('inserts non-existing child (LAST [default])', () => {
      const root: t.ITreeViewNode = { id: 'root', children: [{ id: 'existing' }] };
      const child: t.ITreeViewNode = { id: 'child' };
      const res = TreeUtil.replaceChild(root, child);
      const children = res ? res.children || [] : [];
      expect(children[0]).to.eql({ id: 'existing' });
      expect(children[1]).to.eql({ id: 'child' });
    });

    it('inserts non-existing child (FIRST)', () => {
      const root: t.ITreeViewNode = { id: 'root', children: [{ id: 'existing' }] };
      const child: t.ITreeViewNode = { id: 'child' };
      const res = TreeUtil.replaceChild(root, child, { insert: 'FIRST' });
      const children = res ? res.children || [] : [];
      expect(children[0]).to.eql({ id: 'child' });
      expect(children[1]).to.eql({ id: 'existing' });
    });

    it('replaces an existing child node', () => {
      const root: t.ITreeViewNode = {
        id: 'root',
        children: [{ id: 'foo' }, { id: 'child', data: { foo: 123 } }, { id: 'bar' }],
      };
      const child: t.ITreeViewNode = { id: 'child', data: { foo: 456 } };
      const res = TreeUtil.replaceChild(root, child, { insert: 'FIRST' });
      const children = res ? res.children || [] : [];
      expect(children[1].data).to.eql({ foo: 456 });
    });
  });

  describe('parent', () => {
    it('has a parent', () => {
      const grandchild: t.ITreeViewNode = { id: 'grandchild' };
      const child: t.ITreeViewNode = { id: 'child', children: [grandchild] };
      const root: t.ITreeViewNode = { id: 'root', children: [child] };
      expect(TreeUtil.parent(root, child)).to.equal(root);
      expect(TreeUtil.parent(root, grandchild)).to.equal(child);
    });

    it('has no parent', () => {
      const grandchild: t.ITreeViewNode = { id: 'grandchild' };
      const child: t.ITreeViewNode = { id: 'child', children: [grandchild] };
      const root: t.ITreeViewNode = { id: 'root', children: [] };
      expect(TreeUtil.parent(root, child)).to.equal(undefined);
      expect(TreeUtil.parent(root, grandchild)).to.equal(undefined);
    });
  });

  describe('setProps', () => {
    it('updates props on the root', () => {
      const tree: t.ITreeViewNode = { id: 'root', children: [{ id: 'foo' }] };
      const res = TreeUtil.setProps(tree, 'root', { label: 'Root!' });
      expect(res).to.not.equal(tree); // Clone.
      expect(res && res.props && res.props.label).to.eql('Root!');
    });

    it('updates the given property values (children)', () => {
      let tree: t.ITreeViewNode | undefined = {
        id: 'root',
        children: [{ id: 'foo' }],
      };
      tree = TreeUtil.setProps(tree, 'foo', { label: '1' });
      tree = TreeUtil.setProps(tree, 'foo', { label: '2' });
      tree = TreeUtil.setProps(tree, 'foo', { title: 'My Title' });
      tree = TreeUtil.setProps(tree, 'foo', { label: 'hello' });

      expect(tree && tree.id).to.eql('root');

      const children = TreeUtil.children(tree);
      expect(children[0]).to.eql({
        id: 'foo',
        props: { label: 'hello', title: 'My Title' },
      });
    });
  });

  describe('pathList', () => {
    const D = { id: 'D', props: { label: 'Derp' } };
    const C = { id: 'C', children: [D] };
    const B = { id: 'B' };
    const A = { id: 'A', children: [B, C] };

    it('builds path (via node)', () => {
      const node = { id: 'D' };
      const res = TreeUtil.pathList(A, node);
      expect(res.length).to.eql(3);
      expect(res[0]).to.eql(A);
      expect(res[1]).to.eql(C);
      expect(res[2]).to.eql(D);
      expect(res[2]).to.not.eql(node); // NB: The actual node "D" is returned, not the given node.
    });

    it('builds path (via ID)', () => {
      const res = TreeUtil.pathList(A, 'D');
      expect(res.length).to.eql(3);
      expect(res[0]).to.eql(A);
      expect(res[1]).to.eql(C);
      expect(res[2]).to.eql(D);
    });

    it('alternative path', () => {
      const res = TreeUtil.pathList(A, 'B');
      expect(res.length).to.eql(2);
      expect(res[0]).to.eql(A);
      expect(res[1]).to.eql(B);
    });

    it('root', () => {
      const res = TreeUtil.pathList(A, 'A');
      expect(res.length).to.eql(1);
      expect(res[0]).to.eql(A);
    });

    it('not found (empty [])', () => {
      const res = TreeUtil.pathList(A, 'NO_EXIST');
      expect(res).to.eql([]);
    });
  });

  describe('toggleIsOpen', () => {
    const E = { id: 'E', props: { inline: {} } };
    const D = { id: 'D', props: { inline: { isOpen: false } } };
    const C = { id: 'C', children: [D] };
    const B = { id: 'B' };
    const A = { id: 'A', children: [B, C, E] };

    it('undefined ({inline} not set)', () => {
      const res = TreeUtil.toggleIsOpen(A, A);
      const child = TreeUtil.findById(res, 'B');
      expect(child).to.eql({ id: 'B' });
    });

    it('toggled (false => true => false)', () => {
      const res1 = TreeUtil.toggleIsOpen<t.ITreeViewNode>(A, D);
      const child1 = TreeUtil.findById(res1, 'D');
      expect(child1 && child1.props).to.eql({ inline: { isOpen: true } });

      const res2 = TreeUtil.toggleIsOpen<t.ITreeViewNode>(res1, child1);
      const child2 = TreeUtil.findById(res2, 'D');
      expect(child2 && child2.props).to.eql({ inline: { isOpen: false } });
    });

    it('toggled (undefined => true)', () => {
      const res = TreeUtil.toggleIsOpen<t.ITreeViewNode>(A, E);
      const child = TreeUtil.findById(res, 'E');
      expect(child && child.props).to.eql({ inline: { isOpen: true } });
    });

    it('toggled via "id" (undefined => true)', () => {
      let root = { ...A } as t.ITreeViewNode | undefined;
      root = TreeUtil.toggleIsOpen<t.ITreeViewNode>(root, E.id);
      const child1 = TreeUtil.findById(root, 'E');
      expect(child1 && child1.props).to.eql({ inline: { isOpen: true } });

      root = TreeUtil.toggleIsOpen<t.ITreeViewNode>(root, E.id);
      const child2 = TreeUtil.findById(root, 'E');
      expect(child2 && child2.props).to.eql({ inline: { isOpen: false } });
    });
  });

  describe('openToNode', () => {
    it('no change when nodes are not inline', () => {
      const root = TreeUtil.buildPath({ id: 'ROOT' }, (id) => ({ id }), 'foo/bar/zoo').root;
      const res = TreeUtil.openToNode(root, 'foo/bar/zoo');
      expect(res).to.eql(root);
    });

    it('sets the inline state of nodes to the given path (boolean)', () => {
      const factory: t.TreeNodePathFactory = (id) => ({ id, props: { inline: {} } });
      const root = TreeUtil.buildPath({ id: 'ROOT' }, factory, 'foo/bar').root as t.ITreeViewNode;

      const res = TreeUtil.openToNode(root, 'foo/bar') as t.ITreeViewNode;
      const child1 = TreeUtil.childAt(0, res);
      const child2 = TreeUtil.childAt(0, child1);

      expect(TreeUtil.props(child1).inline).to.eql({ isOpen: true });
      expect(TreeUtil.props(child2).inline).to.eql({ isOpen: true });
    });

    it('sets the inline state of nodes to the given path (object)', () => {
      const factory: t.TreeNodePathFactory = (id) => ({ id, props: { inline: {} } });
      const root = TreeUtil.buildPath({ id: 'ROOT' }, factory, 'foo/bar').root;

      const res = TreeUtil.openToNode(root, 'foo/bar') as t.ITreeViewNode;
      const child1 = TreeUtil.childAt(0, res);
      const child2 = TreeUtil.childAt(0, child1);

      expect(TreeUtil.props(child1).inline).to.eql({ isOpen: true });
      expect(TreeUtil.props(child2).inline).to.eql({ isOpen: true });
    });
  });

  describe('flags', () => {
    it('isOpen', () => {
      expect(TreeUtil.isOpen()).to.eql(undefined);
      expect(TreeUtil.isOpen({ id: 'foo' })).to.eql(undefined);
      expect(TreeUtil.isOpen({ id: 'foo', props: { inline: {} } })).to.eql(undefined);
      expect(TreeUtil.isOpen({ id: 'foo', props: { inline: { isOpen: true } } })).to.eql(true);
      expect(TreeUtil.isOpen({ id: 'foo', props: { inline: { isOpen: false } } })).to.eql(false);
    });

    it('isEnabled', () => {
      expect(TreeUtil.isEnabled()).to.eql(true);
      expect(TreeUtil.isEnabled({ id: 'foo' })).to.eql(true);
      expect(TreeUtil.isEnabled({ id: 'foo', props: { isEnabled: true } })).to.eql(true);
      expect(TreeUtil.isEnabled({ id: 'foo', props: { isEnabled: false } })).to.eql(false);
    });

    it('isSelected', () => {
      expect(TreeUtil.isSelected()).to.eql(false);
      expect(TreeUtil.isSelected({ id: 'foo' })).to.eql(false);
      expect(TreeUtil.isSelected({ id: 'foo', props: { isSelected: false } })).to.eql(false);
      expect(TreeUtil.isSelected({ id: 'foo', props: { isSelected: true } })).to.eql(true);
    });
  });

  describe('buildPath', () => {
    it('build nothing (empty path)', () => {
      const root = { id: 'root' };
      const res = TreeUtil.buildPath(root, (id) => ({ id }), '');
      expect(res.ids).to.eql([]);
      expect(res.root).to.eql(root);
    });

    it('builds path (1 level deep)', () => {
      const root = { id: 'root' };
      const res = TreeUtil.buildPath<t.ITreeViewNode>(root, (id) => ({ id }), 'one');
      expect(res.root.children).to.eql([{ id: 'one' }]);
    });

    it('builds path (3 levels deep)', () => {
      const root = { id: 'root' };
      const res = TreeUtil.buildPath(root, (id) => ({ id }), 'one/two/three');

      const child1 = TreeUtil.findById(res.root, 'one');
      const child2 = TreeUtil.findById(res.root, 'one/two');
      const child3 = TreeUtil.findById(res.root, 'one/two/three');

      expect(child1 && child1.id).to.eql('one');
      expect(child2 && child2.id).to.eql('one/two');
      expect(child3 && child3.id).to.eql('one/two/three');
    });

    it('passes context', () => {
      const list: t.ITreeNodePathContext[] = [];
      const factory: t.TreeNodePathFactory = (id, context) => {
        list.push(context);
        return { id };
      };

      const root = { id: 'ROOT' };
      TreeUtil.buildPath(root, factory, 'one/two/three');

      expect(list.length).to.eql(3);
      expect(list[0].id).to.eql('one/two/three');
      expect(list[1].id).to.eql('one/two');
      expect(list[2].id).to.eql('one');

      expect(list[0].path).to.eql('one/two/three');
      expect(list[1].path).to.eql('one/two/three');
      expect(list[2].path).to.eql('one/two/three');

      expect(list[0].level).to.eql(3);
      expect(list[1].level).to.eql(2);
      expect(list[2].level).to.eql(1);
    });

    it('uses overridden delimiter (:)', () => {
      const root = { id: 'root' };
      const res = TreeUtil.buildPath(root, (id) => ({ id }), 'one:two', {
        delimiter: ':',
      });
      const child1 = TreeUtil.findById(res.root, 'one');
      const child2 = TreeUtil.findById(res.root, 'one:two');
      expect(child1 && child1.id).to.eql('one');
      expect(child2 && child2.id).to.eql('one:two');
    });

    it('does not override existing tree (default)', () => {
      type T = t.ITreeViewNode<string, { foo: number }>;
      let root: T = { id: 'root' };
      root = TreeUtil.buildPath<T>(
        root,
        (id) => ({
          id,
          data: { foo: 1 },
        }),
        'one/two',
      ).root;

      root = TreeUtil.buildPath<T>(
        root,
        (id) => ({
          id,
          data: { foo: 2 },
        }),
        'one/two/three',
      ).root;

      const child1 = TreeUtil.findById(root, 'one/two') as T;
      const child2 = TreeUtil.findById(root, 'one/two') as T;
      const child3 = TreeUtil.findById(root, 'one/two/three') as T;

      expect(child1.data && child1.data.foo).to.eql(1); // NB: not overriden.
      expect(child2.data && child2.data.foo).to.eql(1); // NB: not overriden.
      expect(child3.data && child3.data.foo).to.eql(2); // From second operation.
    });

    it('does not force overrides existing tree', () => {
      type T = t.ITreeViewNode<string, { foo: number }>;
      let root: T = { id: 'ROOT' };
      root = TreeUtil.buildPath<T>(root, (id) => ({ id, data: { foo: 1 } }), 'one/two').root;

      root = TreeUtil.buildPath<T>(root, (id) => ({ id, data: { foo: 2 } }), 'one/two/three', {
        force: true,
      }).root;

      const child1 = TreeUtil.findById(root, 'one/two') as T;
      const child2 = TreeUtil.findById(root, 'one/two') as T;
      const child3 = TreeUtil.findById(root, 'one/two/three') as T;

      expect(child1.data && child1.data.foo).to.eql(2); // NB: not overriden.
      expect(child2.data && child2.data.foo).to.eql(2); // NB: not overriden.
      expect(child3.data && child3.data.foo).to.eql(2); // From second operation.
    });

    it('merges paths (using path builder)', () => {
      const factory: t.TreeNodePathFactory<t.ITreeViewNode> = (id) => ({ id });
      const builder = TreeUtil.pathBuilder({ id: 'ROOT' }, factory);

      builder.add('project/cohort-1');
      builder.add('project/cohort-1/images');
      builder.add('project/cohort-1/README.md');
      builder.add('project/cohort-1/images/logo.png');
      builder.add('project/cohort-2');

      const root = builder.root;
      const project = TreeUtil.find(root, (e) => e.node.id.endsWith('project'));
      const cohort1 = TreeUtil.find(root, (e) => e.node.id.endsWith('/cohort-1'));
      const cohort2 = TreeUtil.find(root, (e) => e.node.id.endsWith('/cohort-2'));
      const readme = TreeUtil.find(root, (e) => e.node.id.endsWith('README.md'));
      const images = TreeUtil.find(root, (e) => e.node.id.endsWith('/images'));
      const logo = TreeUtil.find(root, (e) => e.node.id.endsWith('logo.png'));

      expect(TreeUtil.children(root).length).to.eql(1);
      expect(TreeUtil.children(project).length).to.eql(2);
      expect(TreeUtil.children(cohort1).length).to.eql(2);
      expect(TreeUtil.children(cohort2).length).to.eql(0);

      expect(TreeUtil.hasChild(root, project)).to.eql(true);
      expect(TreeUtil.hasChild(project, cohort1)).to.eql(true);
      expect(TreeUtil.hasChild(project, cohort2)).to.eql(true);
      expect(TreeUtil.hasChild(cohort1, readme)).to.eql(true);
      expect(TreeUtil.hasChild(cohort1, images)).to.eql(true);
      expect(TreeUtil.hasChild(images, logo)).to.eql(true);
    });

    describe('factory returns undefined (node not added)', () => {
      it('nothing added', () => {
        const builder = TreeUtil.pathBuilder({ id: 'ROOT' }, (id) => undefined);
        builder.add('/foo');
        builder.add('/foo/bar');
        builder.add('/foo/bar/baz');
        expect(builder.root).to.eql({ id: 'ROOT' });
      });

      it('leaf node not added', () => {
        const factory: t.TreeNodePathFactory<t.ITreeViewNode> = (id) =>
          id.split('/').length > 2 ? undefined : { id };
        const builder = TreeUtil.pathBuilder({ id: 'ROOT' }, factory);

        builder.add('/foo');
        builder.add('/foo/bar');
        builder.add('/foo/bar/baz');

        const root = builder.root;
        const child1 = TreeUtil.findById(root, 'foo') as t.ITreeViewNode;
        const child2 = TreeUtil.findById(root, 'foo/bar') as t.ITreeViewNode;
        const child3 = TreeUtil.findById(root, 'foo/bar/baz') as t.ITreeViewNode;

        expect(child1.id).to.eql('foo');
        expect(child2.id).to.eql('foo/bar');
        expect(child3).to.eql(undefined);
      });

      it('folder node not added (descendents stopped)', () => {
        const factory: t.TreeNodePathFactory<t.ITreeViewNode> = (id) =>
          id.split('/').length > 2 ? undefined : { id };
        const builder = TreeUtil.pathBuilder({ id: 'ROOT' }, factory);

        builder.add('/foo');
        builder.add('/foo/bar');
        builder.add('/foo/bar/baz');
        builder.add('/foo/bar/baz/zoo');

        const root = builder.root;
        const child1 = TreeUtil.findById(root, 'foo') as t.ITreeViewNode;
        const child2 = TreeUtil.findById(root, 'foo/bar') as t.ITreeViewNode;
        const child3 = TreeUtil.findById(root, 'foo/bar/baz') as t.ITreeViewNode;
        const child4 = TreeUtil.findById(root, 'foo/bar/baz/zoo') as t.ITreeViewNode;

        expect(child1.id).to.eql('foo');
        expect(child2.id).to.eql('foo/bar');
        expect(child3).to.eql(undefined);
        expect(child4).to.eql(undefined);
      });
    });
  });
});
