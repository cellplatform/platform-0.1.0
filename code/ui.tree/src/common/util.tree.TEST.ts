import { expect, ITreeNode, TreeNodeFactory } from '../test';
import { tree as util } from '.';

describe('util.tree', () => {
  describe('walk', () => {
    it('walks from root', () => {
      const tree: ITreeNode = {
        id: 'root',
        children: [{ id: 'child-1' }, { id: 'child-2' }],
      };

      let nodes: ITreeNode[] = [];
      util.walk(tree, node => {
        nodes = [...nodes, node];
      });

      expect(nodes.length).to.eql(3);
      expect(nodes[0]).to.equal(tree);
      expect(nodes[1]).to.equal(tree.children && tree.children[0]);
      expect(nodes[2]).to.equal(tree.children && tree.children[1]);
    });

    it('passes parent as args', () => {
      const grandchild: ITreeNode = { id: 'grandchild' };
      const child: ITreeNode = { id: 'child', children: [grandchild] };
      const root: ITreeNode = { id: 'root', children: [child] };

      let items: Array<{ node: ITreeNode; args: util.WalkArgs }> = [];
      util.walk(root, (node, args) => {
        items = [...items, { node, args }];
      });

      expect(items.length).to.eql(3);
      expect(items[0].args.parent).to.eql(undefined);
      expect(items[1].args.parent).to.eql(root);
      expect(items[2].args.parent).to.eql(child);
    });
  });

  describe('find', () => {
    const tree: ITreeNode = {
      id: 'root',
      children: [{ id: 'child-1' }, { id: 'child-2', children: [{ id: 'child-3' }] }],
    };

    it('finds the given node', () => {
      const res1 = util.find(tree, n => n.id === 'child-3');
      const res2 = util.find(tree, n => n.id === 'NO_EXIT');
      expect(res1).to.eql({ id: 'child-3' });
      expect(res2).to.eql(undefined);
    });

    it('finds the given node by ID', () => {
      const res1 = util.findById(tree, 'child-3');
      const res2 = util.findById(tree, 'NO_EXIST');
      const res3 = util.findById(tree, undefined);
      const res4 = util.findById(tree, { id: 'child-2' });
      expect(res1).to.eql({ id: 'child-3' });
      expect(res2).to.eql(undefined);
      expect(res3).to.eql(undefined);
      expect(res4).to.eql({ id: 'child-2', children: [{ id: 'child-3' }] });
    });
  });

  describe('children', () => {
    it('no childen => empty array', () => {
      const node = { id: 'root' };
      expect(util.children(node)).to.eql([]);
    });

    it('returns child array', () => {
      const node = { id: 'root', children: [{ id: 'child' }] };
      expect(util.children(node)).to.eql([{ id: 'child' }]);
    });
  });

  describe('childAt', () => {
    const root = { id: 'A', children: [{ id: 'B' }, { id: 'C' }] };
    it('undefined', () => {
      expect(util.childAt(0)).to.eql(undefined);
      expect(util.childAt(2, root)).to.eql(undefined);
    });

    it('retrieves child', () => {
      expect(util.childAt(0, root)).to.eql({ id: 'B' });
      expect(util.childAt(1, root)).to.eql({ id: 'C' });
    });
  });

  describe('hasChild', () => {
    const root = { id: 'A', children: [{ id: 'B' }, { id: 'C' }] };
    it('does have child', () => {
      expect(util.hasChild(root, 'B')).to.eql(true);
      expect(util.hasChild(root, 'C')).to.eql(true);
      expect(util.hasChild(root, { id: 'C' })).to.eql(true);
    });

    it('does not have child', () => {
      expect(util.hasChild(root, 'A')).to.eql(false);
      expect(util.hasChild(root, 'NO_MATCH')).to.eql(false);
      expect(util.hasChild(root, undefined)).to.eql(false);
    });
  });

  describe('map', () => {
    const root = { id: 'A', children: [{ id: 'B' }, { id: 'C' }] };
    it('maps the entire tree', () => {
      const res = util.map(root, n => n.id);
      expect(res).to.eql(['A', 'B', 'C']);
    });

    it('stops mapping mid-way through', () => {
      let count = 0;
      const res = util.map(root, (n, args) => {
        count++;
        if (count > 1) {
          args.stop();
        }
        return n.id;
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
      expect(util.depth(root, 'A')).to.eql(0);
      expect(util.depth(root, { id: 'A' })).to.eql(0);
      expect(util.depth(root, 'B')).to.eql(1);
      expect(util.depth(root, 'C')).to.eql(1);
      expect(util.depth(root, 'D')).to.eql(2);
      expect(util.depth(root, { id: 'D' })).to.eql(2);
    });

    it('-1', () => {
      expect(util.depth(undefined, 'C')).to.eql(-1);
      expect(util.depth(root, undefined)).to.eql(-1);
      expect(util.depth(root, 'NO_EXIST')).to.eql(-1);
      expect(util.depth(root, { id: 'NO_EXIST' })).to.eql(-1);
    });
  });

  describe('replace', () => {
    it('replaces root', () => {
      const tree: ITreeNode = { id: 'root' };
      const res = util.replace(tree, {
        id: 'root',
        props: { label: 'hello' },
      });
      expect(res && res.props).to.eql({ label: 'hello' });
    });

    it('replaces child', () => {
      const tree: ITreeNode = { id: 'root', children: [{ id: 'foo' }] };
      const res = util.replace(tree, {
        id: 'foo',
        props: { label: 'hello' },
      });
      const children = util.children(res);
      expect(res && res.id).to.eql('root');
      expect(children[0]).to.eql({ id: 'foo', props: { label: 'hello' } });
    });

    it('replaces grand-child', () => {
      const tree: ITreeNode = {
        id: 'root',
        children: [{ id: 'child', children: [{ id: 'grandchild' }] }],
      };
      const res = util.replace(tree, {
        id: 'grandchild',
        props: { label: 'hello' },
      });
      expect(res && res.id).to.eql('root');

      const child = util.childAt(0, res);
      const grandchild = util.childAt(0, child);
      expect(child.id).to.eql('child');
      expect(grandchild.id).to.eql('grandchild');
    });
  });

  describe('replaceChild', () => {
    it('inserts the given child as clone (no starting children array)', () => {
      const root: ITreeNode = { id: 'root' };
      const child: ITreeNode = { id: 'child' };

      const res = util.replaceChild(root, child);
      const children = res ? res.children || [] : [];

      expect(res).to.not.equal(root);
      expect(res && res.id).to.eql('root');
      expect(children).to.eql([{ id: 'child' }]);
      expect(children[0]).to.not.equal(child);
    });

    it('inserts non-existing child (LAST [default])', () => {
      const root: ITreeNode = { id: 'root', children: [{ id: 'existing' }] };
      const child: ITreeNode = { id: 'child' };
      const res = util.replaceChild(root, child);
      const children = res ? res.children || [] : [];
      expect(children[0]).to.eql({ id: 'existing' });
      expect(children[1]).to.eql({ id: 'child' });
    });

    it('inserts non-existing child (FIRST)', () => {
      const root: ITreeNode = { id: 'root', children: [{ id: 'existing' }] };
      const child: ITreeNode = { id: 'child' };
      const res = util.replaceChild(root, child, { insert: 'FIRST' });
      const children = res ? res.children || [] : [];
      expect(children[0]).to.eql({ id: 'child' });
      expect(children[1]).to.eql({ id: 'existing' });
    });

    it('replaces an existing child node', () => {
      const root: ITreeNode = {
        id: 'root',
        children: [{ id: 'foo' }, { id: 'child', data: { foo: 123 } }, { id: 'bar' }],
      };
      const child: ITreeNode = { id: 'child', data: { foo: 456 } };
      const res = util.replaceChild(root, child, { insert: 'FIRST' });
      const children = res ? res.children || [] : [];
      expect(children[1].data).to.eql({ foo: 456 });
    });
  });

  describe('parent', () => {
    it('has a parent', () => {
      const grandchild: ITreeNode = { id: 'grandchild' };
      const child: ITreeNode = { id: 'child', children: [grandchild] };
      const root: ITreeNode = { id: 'root', children: [child] };
      expect(util.parent(root, child)).to.equal(root);
      expect(util.parent(root, grandchild)).to.equal(child);
    });

    it('has no parent', () => {
      const grandchild: ITreeNode = { id: 'grandchild' };
      const child: ITreeNode = { id: 'child', children: [grandchild] };
      const root: ITreeNode = { id: 'root', children: [] };
      expect(util.parent(root, child)).to.equal(undefined);
      expect(util.parent(root, grandchild)).to.equal(undefined);
    });
  });

  describe('setProps', () => {
    it('updates props on the root', () => {
      const tree: ITreeNode = { id: 'root', children: [{ id: 'foo' }] };
      const res = util.setProps(tree, 'root', { label: 'Root!' });
      expect(res).to.not.equal(tree); // Clone.
      expect(res && res.props && res.props.label).to.eql('Root!');
    });

    it('updates the given property values (children)', () => {
      let tree: ITreeNode | undefined = {
        id: 'root',
        children: [{ id: 'foo' }],
      };
      tree = util.setProps(tree, 'foo', { label: '1' });
      tree = util.setProps(tree, 'foo', { label: '2' });
      tree = util.setProps(tree, 'foo', { title: 'My Title' });
      tree = util.setProps(tree, 'foo', { label: 'hello' });

      expect(tree && tree.id).to.eql('root');

      const children = util.children(tree);
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
      const res = util.pathList(A, node);
      expect(res.length).to.eql(3);
      expect(res[0]).to.eql(A);
      expect(res[1]).to.eql(C);
      expect(res[2]).to.eql(D);
      expect(res[2]).to.not.eql(node); // NB: The actual node "D" is returned, not the given node.
    });

    it('builds path (via ID)', () => {
      const res = util.pathList(A, 'D');
      expect(res.length).to.eql(3);
      expect(res[0]).to.eql(A);
      expect(res[1]).to.eql(C);
      expect(res[2]).to.eql(D);
    });

    it('alternative path', () => {
      const res = util.pathList(A, 'B');
      expect(res.length).to.eql(2);
      expect(res[0]).to.eql(A);
      expect(res[1]).to.eql(B);
    });

    it('root', () => {
      const res = util.pathList(A, 'A');
      expect(res.length).to.eql(1);
      expect(res[0]).to.eql(A);
    });

    it('not found (empty [])', () => {
      const res = util.pathList(A, 'NO_EXIST');
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
      const res = util.toggleIsOpen(A, A);
      const child = util.findById(res, 'B');
      expect(child).to.eql({ id: 'B' });
    });

    it('toggled (false => true => false)', () => {
      const res1 = util.toggleIsOpen<ITreeNode>(A, D);
      const child1 = util.findById(res1, 'D');
      expect(child1 && child1.props).to.eql({ inline: { isOpen: true } });

      const res2 = util.toggleIsOpen<ITreeNode>(res1, child1);
      const child2 = util.findById(res2, 'D');
      expect(child2 && child2.props).to.eql({ inline: { isOpen: false } });
    });

    it('toggled (undefined => true)', () => {
      const res = util.toggleIsOpen<ITreeNode>(A, E);
      const child = util.findById(res, 'E');
      expect(child && child.props).to.eql({ inline: { isOpen: true } });
    });
  });

  describe('flags', () => {
    it('isOpen', () => {
      expect(util.isOpen()).to.eql(undefined);
      expect(util.isOpen({ id: 'foo' })).to.eql(undefined);
      expect(util.isOpen({ id: 'foo', props: { inline: {} } })).to.eql(undefined);
      expect(util.isOpen({ id: 'foo', props: { inline: { isOpen: true } } })).to.eql(true);
      expect(util.isOpen({ id: 'foo', props: { inline: { isOpen: false } } })).to.eql(false);
    });

    it('isEnabled', () => {
      expect(util.isEnabled()).to.eql(true);
      expect(util.isEnabled({ id: 'foo' })).to.eql(true);
      expect(util.isEnabled({ id: 'foo', props: { isEnabled: true } })).to.eql(true);
      expect(util.isEnabled({ id: 'foo', props: { isEnabled: false } })).to.eql(false);
    });

    it('isSelected', () => {
      expect(util.isSelected()).to.eql(false);
      expect(util.isSelected({ id: 'foo' })).to.eql(false);
      expect(util.isSelected({ id: 'foo', props: { isSelected: false } })).to.eql(false);
      expect(util.isSelected({ id: 'foo', props: { isSelected: true } })).to.eql(true);
    });
  });

  describe('buildPath', () => {
    it('build nothing (empty path)', () => {
      const root = { id: 'root' };
      const res = util.buildPath(root, id => ({ id }), '');
      expect(res.ids).to.eql([]);
      expect(res.root).to.eql(root);
    });

    it('builds path (1 level deep)', () => {
      const root = { id: 'root' };
      const res = util.buildPath<ITreeNode>(root, id => ({ id }), 'one');
      expect(res.root.children).to.eql([{ id: 'one' }]);
    });

    it('builds path (3 levels deep)', () => {
      const root = { id: 'root' };
      const res = util.buildPath(root, id => ({ id }), 'one/two/three');

      const child1 = util.findById(res.root, 'one');
      const child2 = util.findById(res.root, 'one/two');
      const child3 = util.findById(res.root, 'one/two/three');

      expect(child1 && child1.id).to.eql('one');
      expect(child2 && child2.id).to.eql('one/two');
      expect(child3 && child3.id).to.eql('one/two/three');
    });

    it('uses overridden delimiter (:)', () => {
      const root = { id: 'root' };
      const res = util.buildPath(root, id => ({ id }), 'one:two', {
        delimiter: ':',
      });
      const child1 = util.findById(res.root, 'one');
      const child2 = util.findById(res.root, 'one:two');
      expect(child1 && child1.id).to.eql('one');
      expect(child2 && child2.id).to.eql('one:two');
    });

    it('does not override existing tree (default)', () => {
      type T = ITreeNode<string, { foo: number }>;
      let root: T = { id: 'root' };
      root = util.buildPath<T>(
        root,
        id => ({
          id,
          data: { foo: 1 },
        }),
        'one/two',
      ).root;

      root = util.buildPath<T>(
        root,
        id => ({
          id,
          data: { foo: 2 },
        }),
        'one/two/three',
      ).root;

      const child1 = util.findById(root, 'one/two') as T;
      const child2 = util.findById(root, 'one/two') as T;
      const child3 = util.findById(root, 'one/two/three') as T;

      expect(child1.data && child1.data.foo).to.eql(1); // NB: not overriden.
      expect(child2.data && child2.data.foo).to.eql(1); // NB: not overriden.
      expect(child3.data && child3.data.foo).to.eql(2); // From second operation.
    });

    it('does not force overrides existing tree', () => {
      type T = ITreeNode<string, { foo: number }>;
      let root: T = { id: 'ROOT' };
      root = util.buildPath<T>(root, id => ({ id, data: { foo: 1 } }), 'one/two').root;

      root = util.buildPath<T>(root, id => ({ id, data: { foo: 2 } }), 'one/two/three', {
        force: true,
      }).root;

      const child1 = util.findById(root, 'one/two') as T;
      const child2 = util.findById(root, 'one/two') as T;
      const child3 = util.findById(root, 'one/two/three') as T;

      expect(child1.data && child1.data.foo).to.eql(2); // NB: not overriden.
      expect(child2.data && child2.data.foo).to.eql(2); // NB: not overriden.
      expect(child3.data && child3.data.foo).to.eql(2); // From second operation.
    });

    it('merges paths (using path builder)', () => {
      const factory: TreeNodeFactory<ITreeNode> = id => ({ id });
      const builder = util.pathBuilder({ id: 'ROOT' }, factory);

      builder.add('project/cohort-1');
      builder.add('project/cohort-1/images');
      builder.add('project/cohort-1/README.md');
      builder.add('project/cohort-1/images/logo.png');
      builder.add('project/cohort-2');

      const root = builder.root;
      const project = util.find(root, n => n.id.endsWith('project'));
      const cohort1 = util.find(root, n => n.id.endsWith('/cohort-1'));
      const cohort2 = util.find(root, n => n.id.endsWith('/cohort-2'));
      const readme = util.find(root, n => n.id.endsWith('README.md'));
      const images = util.find(root, n => n.id.endsWith('/images'));
      const logo = util.find(root, n => n.id.endsWith('logo.png'));

      expect(util.children(root).length).to.eql(1);
      expect(util.children(project).length).to.eql(2);
      expect(util.children(cohort1).length).to.eql(2);
      expect(util.children(cohort2).length).to.eql(0);

      expect(util.hasChild(root, project)).to.eql(true);
      expect(util.hasChild(project, cohort1)).to.eql(true);
      expect(util.hasChild(project, cohort2)).to.eql(true);
      expect(util.hasChild(cohort1, readme)).to.eql(true);
      expect(util.hasChild(cohort1, images)).to.eql(true);
      expect(util.hasChild(images, logo)).to.eql(true);
    });

    describe('factory returns undefined (node not added)', () => {
      it('nothing added', () => {
        const builder = util.pathBuilder({ id: 'ROOT' }, id => undefined);
        builder.add('/foo');
        builder.add('/foo/bar');
        builder.add('/foo/bar/baz');
        expect(builder.root).to.eql({ id: 'ROOT' });
      });

      it('leaf node not added', () => {
        const factory: TreeNodeFactory<ITreeNode> = id =>
          id.split('/').length > 2 ? undefined : { id };
        const builder = util.pathBuilder({ id: 'ROOT' }, factory);

        builder.add('/foo');
        builder.add('/foo/bar');
        builder.add('/foo/bar/baz');

        const root = builder.root;
        const child1 = util.findById(root, 'foo') as ITreeNode;
        const child2 = util.findById(root, 'foo/bar') as ITreeNode;
        const child3 = util.findById(root, 'foo/bar/baz') as ITreeNode;

        expect(child1.id).to.eql('foo');
        expect(child2.id).to.eql('foo/bar');
        expect(child3).to.eql(undefined);
      });

      it('folder node not added (descendents stopped)', () => {
        const factory: TreeNodeFactory<ITreeNode> = id =>
          id.split('/').length > 2 ? undefined : { id };
        const builder = util.pathBuilder({ id: 'ROOT' }, factory);

        builder.add('/foo');
        builder.add('/foo/bar');
        builder.add('/foo/bar/baz');
        builder.add('/foo/bar/baz/zoo');

        const root = builder.root;
        const child1 = util.findById(root, 'foo') as ITreeNode;
        const child2 = util.findById(root, 'foo/bar') as ITreeNode;
        const child3 = util.findById(root, 'foo/bar/baz') as ITreeNode;
        const child4 = util.findById(root, 'foo/bar/baz/zoo') as ITreeNode;

        expect(child1.id).to.eql('foo');
        expect(child2.id).to.eql('foo/bar');
        expect(child3).to.eql(undefined);
        expect(child4).to.eql(undefined);
      });
    });
  });
});
