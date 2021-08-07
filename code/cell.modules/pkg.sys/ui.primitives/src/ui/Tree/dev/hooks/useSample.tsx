import React, { useEffect, useState } from 'react';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { COLORS, css, Icons, log, t, Tree } from '../common';

export function useSample(args: {
  bus: t.EventBus<t.TreeviewEvent>;
  isEnabled: boolean;
  initial: t.ITreeviewNode;
}) {
  const { bus, isEnabled, initial } = args;
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

    events.render.header$.pipe(filter((e) => e.node.id === 'root.3')).subscribe((e) => {
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

      e.render(el);
    });

    /**
     * Handle mouse.
     */

    const toggle = (node: t.ITreeviewNode) => {
      setRoot(Tree.util.toggleIsOpen(root, node));
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
        const parent = Tree.util
          .query(root)
          .ancestor(e.node, (e) => e.level > 0 && !e.node.props?.treeview?.inline);
        setCurrent(parent?.id);
      });

    /**
     * Dispose
     */
    return () => dispose$.next();
  }, [bus, isEnabled, initial]); // eslint-disable-line

  return {
    root: isEnabled ? root : undefined,
    current: isEnabled ? current : undefined,
  };
}
