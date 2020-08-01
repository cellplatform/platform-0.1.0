import { expect, t } from '../test';

import { TreeUtil } from '.';
const query = TreeUtil.query;

type P = t.ITreeNodePropsTreeView & { data: { foo?: number } };
type N = t.ITreeViewNode<P>;

describe('TreeUtil', () => {
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

  describe('replace', () => {
    it('replaces root', () => {
      const tree: t.ITreeViewNode = { id: 'root' };
      const res = TreeUtil.replace(tree, {
        id: 'root',
        props: { treeview: { label: 'hello' } },
      });
      expect(res && res.props).to.eql({ treeview: { label: 'hello' } });
    });

    it('replaces child', () => {
      const tree: t.ITreeViewNode = { id: 'root', children: [{ id: 'foo' }] };
      const res = TreeUtil.replace(tree, {
        id: 'foo',
        props: { treeview: { label: 'hello' } },
      });
      const children = TreeUtil.children(res);
      expect(res && res.id).to.eql('root');
      expect(children[0]).to.eql({ id: 'foo', props: { treeview: { label: 'hello' } } });
    });

    it('replaces grand-child', () => {
      const tree: t.ITreeViewNode = {
        id: 'root',
        children: [{ id: 'child', children: [{ id: 'grandchild' }] }],
      };
      const res = TreeUtil.replace(tree, {
        id: 'grandchild',
        props: { treeview: { label: 'hello' } },
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
      const root: N = {
        id: 'root',
        children: [{ id: 'foo' }, { id: 'child', props: { data: { foo: 123 } } }, { id: 'bar' }],
      };
      const child: N = { id: 'child', props: { data: { foo: 456 } } };
      const res = TreeUtil.replaceChild<N>(root, child, { insert: 'FIRST' });
      const children = res ? res.children || [] : [];
      expect(children[1].props?.data).to.eql({ foo: 456 });
    });
  });

  describe('setProps', () => {
    it('updates props on the root', () => {
      const tree: t.ITreeViewNode = { id: 'root', children: [{ id: 'foo' }] };
      const res = TreeUtil.setProps(tree, 'root', { label: 'Root!' });
      expect(res).to.not.equal(tree); // Clone.
      expect(res?.props?.treeview?.label).to.eql('Root!');
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
        props: { treeview: { label: 'hello', title: 'My Title' } },
      });
    });
  });

  describe('pathList', () => {
    const D = { id: 'D', props: { treeview: { label: 'Derp' } } };
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
    const E = { id: 'E', props: { treeview: { inline: {} } } };
    const D = { id: 'D', props: { treeview: { inline: { isOpen: false } } } };
    const C = { id: 'C', children: [D] };
    const B = { id: 'B' };
    const A = { id: 'A', children: [B, C, E] };

    it('undefined ({inline} not set)', () => {
      const res = TreeUtil.toggleIsOpen(A, A);
      const child = query(res).findById('B');
      expect(child).to.eql({ id: 'B' });
    });

    it('toggled (false => true => false)', () => {
      const res1 = TreeUtil.toggleIsOpen<t.ITreeViewNode>(A, D);
      const child1 = query(res1).findById('D');
      expect(child1 && child1.props).to.eql({ treeview: { inline: { isOpen: true } } });

      const res2 = TreeUtil.toggleIsOpen<t.ITreeViewNode>(res1, child1);
      const child2 = query(res2).findById('D');
      expect(child2 && child2.props).to.eql({ treeview: { inline: { isOpen: false } } });
    });

    it('toggled (undefined => true)', () => {
      const res = TreeUtil.toggleIsOpen<t.ITreeViewNode>(A, E);
      const child = query(res).findById('E');
      expect(child && child.props).to.eql({ treeview: { inline: { isOpen: true } } });
    });

    it('toggled via "id" (undefined => true)', () => {
      let root = { ...A } as t.ITreeViewNode | undefined;
      root = TreeUtil.toggleIsOpen<t.ITreeViewNode>(root, E.id);
      const child1 = query(root).findById('E');
      expect(child1 && child1.props).to.eql({ treeview: { inline: { isOpen: true } } });

      root = TreeUtil.toggleIsOpen<t.ITreeViewNode>(root, E.id);
      const child2 = query(root).findById('E');
      expect(child2 && child2.props).to.eql({ treeview: { inline: { isOpen: false } } });
    });
  });

  describe('openToNode', () => {
    it('no change when nodes are not inline', () => {
      const root = TreeUtil.buildPath({ id: 'ROOT' }, (id) => ({ id }), 'foo/bar/zoo').root;
      const res = TreeUtil.openToNode(root, 'foo/bar/zoo');
      expect(res).to.eql(root);
    });

    it('sets the inline state of nodes to the given path (boolean)', () => {
      const factory: t.TreeNodePathFactory = (id) => ({ id, props: { treeview: { inline: {} } } });
      const root = TreeUtil.buildPath({ id: 'ROOT' }, factory, 'foo/bar').root as t.ITreeViewNode;

      const res = TreeUtil.openToNode(root, 'foo/bar') as t.ITreeViewNode;
      const child1 = TreeUtil.childAt(0, res);
      const child2 = TreeUtil.childAt(0, child1);

      expect(TreeUtil.props(child1).inline).to.eql({ isOpen: true });
      expect(TreeUtil.props(child2).inline).to.eql({ isOpen: true });
    });

    it('sets the inline state of nodes to the given path (object)', () => {
      const factory: t.TreeNodePathFactory = (id) => ({ id, props: { treeview: { inline: {} } } });
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
      const isOpen = TreeUtil.isOpen;
      expect(isOpen()).to.eql(undefined);
      expect(isOpen({ id: 'a' })).to.eql(undefined);
      expect(isOpen({ id: 'a', props: { treeview: { inline: {} } } })).to.eql(undefined);
      expect(isOpen({ id: 'a', props: { treeview: { inline: { isOpen: true } } } })).to.eql(true);
      expect(isOpen({ id: 'a', props: { treeview: { inline: { isOpen: false } } } })).to.eql(false);
    });

    it('isEnabled', () => {
      const isEnabled = TreeUtil.isEnabled;
      expect(isEnabled()).to.eql(true);
      expect(isEnabled({ id: 'foo' })).to.eql(true);
      expect(isEnabled({ id: 'foo', props: { treeview: { isEnabled: true } } })).to.eql(true);
      expect(isEnabled({ id: 'foo', props: { treeview: { isEnabled: false } } })).to.eql(false);
    });

    it('isSelected', () => {
      const isSelected = TreeUtil.isSelected;
      expect(isSelected()).to.eql(false);
      expect(isSelected({ id: 'foo' })).to.eql(false);
      expect(isSelected({ id: 'foo', props: { treeview: { isSelected: false } } })).to.eql(false);
      expect(isSelected({ id: 'foo', props: { treeview: { isSelected: true } } })).to.eql(true);
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

      const child1 = query(res.root).findById('one');
      const child2 = query(res.root).findById('one/two');
      const child3 = query(res.root).findById('one/two/three');

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
      const child1 = query(res.root).findById('one');
      const child2 = query(res.root).findById('one:two');
      expect(child1 && child1.id).to.eql('one');
      expect(child2 && child2.id).to.eql('one:two');
    });

    it('does not override existing tree (default)', () => {
      let root: N = { id: 'root' };
      const b = TreeUtil.buildPath;
      root = b<N>(root, (id) => ({ id, props: { data: { foo: 1 } } }), 'one/two').root;
      root = b<N>(root, (id) => ({ id, props: { data: { foo: 2 } } }), 'one/two/three').root;

      const child1 = query<N>(root).findById('one/two');
      const child2 = query<N>(root).findById('one/two');
      const child3 = query<N>(root).findById('one/two/three');

      expect(child1?.props?.data?.foo).to.eql(1); // NB: not overriden.
      expect(child2?.props?.data?.foo).to.eql(1); // NB: not overriden.
      expect(child3?.props?.data?.foo).to.eql(2); // From second operation.
    });

    it('does not force overrides existing tree', () => {
      let root: N = { id: 'ROOT' };
      const b = TreeUtil.buildPath;
      root = b<N>(root, (id) => ({ id, props: { data: { foo: 1 } } }), 'one/two').root;
      root = b<N>(root, (id) => ({ id, props: { data: { foo: 2 } } }), 'one/two/three', {
        force: true,
      }).root;

      const child1 = query<N>(root).findById('one/two');
      const child2 = query<N>(root).findById('one/two');
      const child3 = query<N>(root).findById('one/two/three');

      expect(child1?.props?.data.foo).to.eql(2); // NB: not overriden.
      expect(child2?.props?.data.foo).to.eql(2); // NB: not overriden.
      expect(child3?.props?.data.foo).to.eql(2); // From second operation.
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
      const project = query(root).find((e) => e.node.id.endsWith('project'));
      const cohort1 = query(root).find((e) => e.node.id.endsWith('/cohort-1'));
      const cohort2 = query(root).find((e) => e.node.id.endsWith('/cohort-2'));
      const readme = query(root).find((e) => e.node.id.endsWith('README.md'));
      const images = query(root).find((e) => e.node.id.endsWith('/images'));
      const logo = query(root).find((e) => e.node.id.endsWith('logo.png'));

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
        const child1 = query(root).findById('foo') as t.ITreeViewNode;
        const child2 = query(root).findById('foo/bar') as t.ITreeViewNode;
        const child3 = query(root).findById('foo/bar/baz') as t.ITreeViewNode;

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
        const child1 = query(root).findById('foo') as t.ITreeViewNode;
        const child2 = query(root).findById('foo/bar') as t.ITreeViewNode;
        const child3 = query(root).findById('foo/bar/baz') as t.ITreeViewNode;
        const child4 = query(root).findById('foo/bar/baz/zoo') as t.ITreeViewNode;

        expect(child1.id).to.eql('foo');
        expect(child2.id).to.eql('foo/bar');
        expect(child3).to.eql(undefined);
        expect(child4).to.eql(undefined);
      });
    });
  });
});
