import React, { useEffect, useState } from 'react';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { COLORS, css, Icons, log, t, Tree } from '../common';

export function useTreeEventsSample(args: {
  bus: t.EventBus<t.TreeviewEvent>;
  isEnabled: boolean;
  initial: t.ITreeviewNode;
  columns: number;
}) {
  const { columns, bus, isEnabled, initial } = args;
  const [root, setRoot] = useState<t.ITreeviewNode | undefined>();
  const [current, setCurrent] = useState<string | undefined>();

  useEffect(() => {
    const dispose$ = new Subject<void>();
    const $ = bus.$.pipe(
      takeUntil(dispose$),
      filter(() => isEnabled),
    );

    setRoot(initial);
    const events = Tree.Events.create($);

    events.mouse().click.node$.subscribe((e) => {
      log.info('🐷 CLICK from TreeEvents helper', e);
    });

    // Log events.
    $.subscribe((e) => {
      // log.info('🌳', e.type, e.payload);
    });

    events.render.icon$.pipe(filter((e) => e.icon !== 'Face')).subscribe((e) => {
      e.render(Icons[e.icon]);
    });

    events.beforeRender.header$.subscribe((e) => {
      e.change((draft) => {
        // const header = draft.header || (draft.header = {});
        // draft.header;
        // draft.label = 'foo';
      });
    });

    events.beforeRender.node$.pipe(filter((e) => e.node.id === 'root.2')).subscribe((e) => {
      //
      e.change((draft) => {
        // Tree.Util.
        // toggle(draft)
        const inline = draft.inline ?? (draft.inline = {});
        inline.isOpen = true;

        // draft.inline?.isOpen = true;
      });
    });

    // events.render.nodeBody$
    //   .pipe(
    //     // filter((e) => e.node.id === 'root.2'),
    //     filter((e) => true),
    //   )
    //   .subscribe((e) => {
    //     console.log('e', e);
    //     const el = <div>Foo</div>;

    //     e.render(el);
    //   });

    const renderHeader = (
      id: string,
      fn: (e: t.RenderTreeHeaderArgs, render: (el: JSX.Element) => void) => void,
    ) => {
      //
      events.render.header$.pipe(filter((e) => e.node.id === id)).subscribe((e) => {
        fn(e, e.render);
      });
    };

    renderHeader('root.3', (e, render) => {
      const styles = {
        base: css({
          flex: 1,
          lineHeight: '1.6em',
          MarginX: 2,
          marginTop: 2,
          backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
          padding: 6,
        }),
        link: css({ color: COLORS.BLUE, cursor: 'pointer' }),
      };
      const el = (
        <div {...styles.base}>
          <div>My Custom Header: {e.node.id}</div>
          <div {...styles.link} onClick={() => setCurrent('root')}>
            Home
          </div>
        </div>
      );

      render(el);
    });

    renderHeader('root', (e, render) => {
      console.log('args.columns', args.columns);
      if (args.columns < 2) return;
      const styles = {
        base: css({
          flex: 1,
          backgroundColor: 'rgba(255, 0, 0, 0.06)' /* RED */,
          display: 'grid',
          alignContent: 'center',
          justifyContent: 'center',
        }),
      };
      const el = <div {...styles.base}>👋</div>;

      render(el);
    });

    // events.render.header$.pipe(filter((e) => e.node.id === 'root.3')).subscribe((e) => {
    //   const styles = {
    //     base: css({
    //       flex: 1,
    //       lineHeight: '1.6em',
    //       MarginX: 2,
    //       marginTop: 2,
    //       backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
    //       padding: 6,
    //     }),
    //     link: css({ color: COLORS.BLUE, cursor: 'pointer' }),
    //   };
    //   const el = (
    //     <div {...styles.base}>
    //       <div>My Custom Header: {e.node.id}</div>
    //       <div {...styles.link} onClick={() => setCurrent('root')}>
    //         Home
    //       </div>
    //     </div>
    //   );

    //   e.render(el);
    // });

    /**
     * Handle mouse.
     */

    const toggle = (node: t.ITreeviewNode) => {
      setRoot(Tree.Util.toggleIsOpen(root, node));
    };

    const click$ = events.mouse$({ button: 'LEFT' });

    click$
      .pipe(
        filter((e) => e.type === 'DOWN'),
        filter((e) => e.target === 'DRILL_IN'),
      )
      .subscribe((e) => setCurrent(e.id));

    click$
      .pipe(
        filter((e) => e.type === 'DOWN'),
        filter((e) => e.target === 'TWISTY'),
      )
      .subscribe((e) => toggle(e.node));

    click$
      .pipe(
        filter((e) => e.type === 'DOUBLE_CLICK'),
        filter((e) => e.target === 'NODE'),
        filter((e) => !Boolean(e.props.inline)),
        filter((e) => !Boolean(e.props.labelEditable)),
      )
      .subscribe((e) => setCurrent(e.id));

    click$
      .pipe(
        filter((e) => e.type === 'DOUBLE_CLICK'),
        filter((e) => e.target === 'NODE'),
        filter((e) => Boolean(e.props.inline)),
        filter((e) => !Boolean(e.props.labelEditable)),
      )
      .subscribe((e) => toggle(e.node));

    click$
      .pipe(
        filter((e) => e.type === 'DOWN'),
        filter((e) => e.target === 'PARENT'),
      )
      .subscribe((e) => {
        const parent = Tree.Util.query(root).ancestor(
          e.node,
          (e) => e.level > 0 && !e.node.props?.treeview?.inline,
        );
        setCurrent(parent?.id);
      });

    /**
     * Dispose
     */
    return () => dispose$.next();
  }, [bus, isEnabled, initial, columns]); // eslint-disable-line

  return {
    isEnabled,
    root: isEnabled ? root : undefined,
    current: isEnabled ? current : undefined,
  };
}
