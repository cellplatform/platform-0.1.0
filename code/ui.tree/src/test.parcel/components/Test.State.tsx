import { color, css, CssValue } from '@platform/css';
import { Button } from '@platform/ui.button';
import * as React from 'react';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

import { Treeview } from '../..';
import { t } from '../../common';
import { TreeviewState } from '../../components.dev/TreeviewState';
import { TreeviewStrategy } from '../../TreeviewStrategy';

type Node = t.ITreeviewNode;
const header: t.ITreeviewNodeHeader = { isVisible: false, marginBottom: 45 };

const DEFAULT: Node = {
  id: 'root',
  props: { treeview: { label: 'Root', header } },
  children: [
    {
      id: 'Default-1',
      children: [
        { id: 'Child-1.1' },
        {
          id: 'Child-1.2',
          props: { treeview: { inline: {} } },
          children: [
            {
              id: 'Child-1.2.1',
              props: { treeview: { inline: {} } },
              children: [{ id: 'Child-1.2.1.1' }, { id: 'Child-1.2.1.2' }, { id: 'Child-1.2.1.3' }],
            },
            { id: 'Child-1.2.2' },
            { id: 'Child-1.2.3' },
          ],
        },
        { id: 'Child-1.3' },
      ],
    },
    {
      id: 'Default-2',
      props: { treeview: { inline: {} } },
      children: [
        { id: 'Child-2.1' },
        {
          id: 'Child-2.2',
          props: { treeview: { inline: {} } },
          children: [
            {
              id: 'Child-2.2.1',
              props: { treeview: { inline: {} } },
              children: [{ id: 'Child-2.2.1.1' }],
            },
            { id: 'Child-2.2.2' },
          ],
        },
        {
          id: 'Child-2.3',
          props: { treeview: { inline: {} } },
          children: [{ id: 'Child-2.3.1' }],
        },
      ],
    },
    { id: 'Default-3' },
  ],
};

const TWISTY: Node = {
  id: 'root',
  props: { treeview: { label: 'Root', header } },
  children: [
    { id: 'Default-1' },
    {
      id: 'Default-2',
      props: { treeview: { inline: {} } },
      children: [{ id: 'Child-2.1' }, { id: 'Child-2.2' }, { id: 'Child-2.3' }],
    },
    { id: 'Default-3' },
    { id: 'Default-4' },
  ],
};

const SAMPLES = { DEFAULT, TWISTY };

Object.keys(SAMPLES).forEach((key) => {
  const node = SAMPLES[key];
  Treeview.query(node).walkDown((e) => {
    Treeview.util.props(e.node, (props) => {
      props.label = props.label || e.id;
    });
  });
});

export type ITestProps = { style?: CssValue };

export class Test extends React.PureComponent<ITestProps> {
  private unmounted$ = new Subject<void>();
  private treeview$ = new Subject<t.TreeviewEvent>();
  private tree = Treeview.State.create({
    root: SAMPLES.DEFAULT,
    // root: SAMPLES.TWISTY,
    dispose$: this.unmounted$,
  });

  /**
   * [Lifecycle]
   */
  public componentDidMount() {
    const fire: t.FireEvent<t.TreeviewEvent> = (e) => this.treeview$.next(e);
    const tree = this.tree;
    const changed$ = tree.event.changed$.pipe(takeUntil(this.unmounted$));
    changed$.pipe(debounceTime(10)).subscribe(() => this.forceUpdate());

    /**
     * State behavior strategy.
     */
    const strategy = TreeviewStrategy.default({ fire });
    this.treeview$
      .pipe(takeUntil(this.unmounted$))
      .subscribe((event) => strategy.next({ tree, event }));
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Properties]
   */
  public get nav() {
    return this.tree.state.props?.treeview?.nav || {};
  }

  public get current() {
    return this.nav.current;
  }

  public get selected() {
    return this.nav.selected;
  }

  /**
   * [Render]
   */
  public render() {
    const styles = {
      base: css({
        Absolute: 0,
        Flex: 'horizontal-stretch-stretch',
        backgroundColor: color.format(0.5),
      }),
    };
    return (
      <div {...css(styles.base, this.props.style)}>
        {this.renderTree({ edge: 'left', focusOnLoad: true })}
        {this.renderCenter()}
        {this.renderTree({ edge: 'right' })}
      </div>
    );
  }

  private renderTree(args: { edge: 'left' | 'right'; focusOnLoad?: boolean }) {
    const { edge } = args;
    const styles = {
      base: css({
        width: 280,
        display: 'flex',
        borderLeft: edge === 'right' && `solid 1px ${color.format(-0.1)}`,
        borderRight: edge === 'left' && `solid 1px ${color.format(-0.1)}`,
        WebkitAppRegion: 'drag',
      }),
    };
    return (
      <div {...styles.base}>
        <Treeview
          root={this.tree.state}
          current={this.current}
          event$={this.treeview$}
          background={'NONE'}
          tabIndex={0}
          focusOnLoad={args.focusOnLoad}
        />
      </div>
    );
  }

  private renderCenter() {
    const styles = {
      base: css({
        flex: 1,
        position: 'relative',
        boxSizing: 'border-box',
        backgroundColor: color.format(1),
        Flex: 'vertical-stretch-stretch',
      }),
      body: css({ position: 'relative', flex: 1 }),
      scroll: css({
        Absolute: 0,
        padding: 30,
        paddingTop: 80,
        PaddingX: 50,
        Scroll: true,
        paddingBottom: 100,
        Flex: 'start-spaceBetween',
      }),
      state: css({ flex: 1, maxWidth: 680 }),
    };

    return (
      <div {...styles.base}>
        {this.renderToolbar()}
        <div {...styles.body}>
          <div {...styles.scroll}>
            <div />
            <TreeviewState
              store={this.tree}
              current={this.current}
              selected={this.selected}
              style={styles.state}
            />
            <div />
          </div>
        </div>
      </div>
    );
  }

  private renderToolbar() {
    const styles = {
      base: css({
        position: 'relative',
        height: 34,
        borderBottom: `solid 1px ${color.format(-0.1)}`,
        Flex: 'horizontal-center-start',
        fontSize: 14,
        PaddingX: 15,
        color: color.format(-0.3),
      }),
      spacer: css({ MarginX: 6 }),
      div: css({
        MarginX: 15,
        borderLeft: `solid 1px ${color.format(-0.1)}`,
        height: '70%',
      }),
    };

    const spacer = <div {...styles.spacer} />;
    const div = <div {...styles.div} />;

    return (
      <div {...styles.base}>
        <Button onClick={this.onRedrawClick}>Redraw</Button>
        {div}
        <div>Load:</div>
        {spacer}
        <Button onClick={this.loadHandler(SAMPLES.DEFAULT)}>Default</Button>
        {spacer}
        <Button onClick={this.loadHandler(SAMPLES.TWISTY)}>Twisty</Button>
        {div}
        <Button onClick={this.tree.clear}>Clear</Button>
      </div>
    );
  }

  /**
   * [Handlers]
   */
  private onRedrawClick = () => this.forceUpdate();

  private loadHandler = (root: Node) => {
    return () => {
      this.tree.change((draft) => (draft.children = root.children));
    };
  };
}
