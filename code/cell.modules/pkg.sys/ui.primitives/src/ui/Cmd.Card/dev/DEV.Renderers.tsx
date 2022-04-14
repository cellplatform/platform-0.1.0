import React from 'react';

import { COLORS, color, css, t } from '../common';
import { ObjectView } from 'sys.ui.dev';
import { Button } from '../../../ui.ref/button/Button';

export type A = { count: number; kind: t.CmdCardPart };
export type B = { msg?: string; kind: t.CmdCardPart };

const DebugCount = {
  body: 0,
  backdrop: 0,
};

/**
 * BODY
 */
const renderSampleBody: t.CmdCardRender<A> = (e) => {
  DebugCount.body++;
  const { size } = e;

  const styles = {
    base: css({
      Absolute: 40,
      Flex: 'center-center',
      border: `dashed 1px ${color.format(-0.2)}`,
      backgroundColor: color.alpha(COLORS.DARK, 0.04),
      borderRadius: 10,
    }),
    title: css({ Absolute: [10, null, null, 12] }),
    render: css({ Absolute: [5, 8, null, null], fontSize: 11, opacity: 0.5 }),
    state: css({ Absolute: [null, null, 10, 12] }),
  };

  const tmp = () => {
    e.state.patch((doc, ctx) => {
      doc.count = (doc.count ?? 0) + 1;
      doc.kind = 'Body';
    });
  };

  const data = e.state.current;

  return (
    <div {...styles.base}>
      <div {...styles.title}>{`"My Body"`}</div>
      <div {...styles.render}>{`${size.width} x ${size.height}, render-${DebugCount.body}`}</div>
      <ObjectView name={'body.state.current'} data={data} style={styles.state} fontSize={11} />
      <Button onClick={tmp}>increment</Button>
    </div>
  );
};

/**
 * BACKDROP
 */
const renderSampleBackdrop: t.CmdCardRender<B> = (e) => {
  DebugCount.backdrop++;

  const styles = {
    base: css({
      Absolute: [10, 10, 0, 10],
      Size: e.size,
      Flex: 'center-center',
      color: color.format(1),
      border: `dashed 1px ${color.format(0.3)}`,
      backgroundColor: 'rgba(255, 0, 0, 0.06)',
      borderRadius: 5,
    }),
    title: css({ Absolute: [10, null, null, 12] }),
    render: css({ Absolute: [5, 8, null, null], fontSize: 11, opacity: 0.5 }),
    state: css({ Absolute: [null, null, 10, 12] }),
  };
  return (
    <div {...styles.base}>
      <div {...styles.title}>{`"My Backdrop"`}</div>
      <div {...styles.render}>{`render-${DebugCount.backdrop}`}</div>
      <ObjectView
        name={'body.state'}
        data={e.state}
        style={styles.state}
        fontSize={11}
        theme={'DARK'}
      />
    </div>
  );
};

/**
 * INDEX
 */
export const SampleRenderer = {
  backdrop: renderSampleBackdrop,
  body: renderSampleBody,
};
