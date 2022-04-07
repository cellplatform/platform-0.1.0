import React from 'react';

import { color, css, t } from '../common';
import { ObjectView } from 'sys.ui.dev';
import { Button } from '../../../ui.ref/button/Button';

const count = {
  body: 0,
  backdrop: 0,
};

type A = { count: number; kind: t.CmdCardPart };

/**
 * BACKDROP
 */
const renderBackdrop: t.CmdCardRender<A> = (e) => {
  count.backdrop++;

  const styles = {
    base: css({
      Absolute: [10, 10, 0, 10],
      Size: e.size,
      Flex: 'center-center',
      color: color.format(1),
      border: `dashed 1px ${color.format(0.3)}`,
      backgroundColor: 'rgba(255, 0, 0, 0.06)' /* RED */,
      borderRadius: 5,
    }),
    title: css({ Absolute: [10, null, null, 12] }),
    render: css({ Absolute: [5, 8, null, null], fontSize: 11, opacity: 0.5 }),
    state: css({ Absolute: [null, null, 10, 12] }),
  };
  return (
    <div {...styles.base}>
      <div {...styles.title}>{`"My Backdrop"`}</div>
      <div {...styles.render}>{`render-${count.backdrop}`}</div>
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
 * BODY
 */
const renderBody: t.CmdCardRender<A> = (e) => {
  count.body++;
  const { size } = e;

  const styles = {
    base: css({
      Absolute: 10,
      Flex: 'center-center',
      border: `dashed 1px ${color.format(-0.2)}`,
      backgroundColor: 'rgba(255, 0, 0, 0.02)' /* RED */,
      borderRadius: 10,
    }),
    title: css({ Absolute: [10, null, null, 12] }),
    render: css({ Absolute: [5, 8, null, null], fontSize: 11, opacity: 0.5 }),
    state: css({ Absolute: [null, null, 10, 12] }),
  };

  const data = e.state.current;

  const tmp = () => {
    e.state.patch((doc, ctx) => {
      doc.count = (doc.count ?? 0) + 1;
      doc.kind = 'Body';
    });
  };

  const elButton = <Button onClick={tmp}>increment</Button>;

  return (
    <div {...styles.base}>
      <div {...styles.title}>{`"My Body"`}</div>
      <div {...styles.render}>{`${size.width} x ${size.height}, render-${count.body}`}</div>
      <ObjectView name={'body.state'} data={data} style={styles.state} fontSize={11} />
      {elButton}
    </div>
  );
};

/**
 * INDEX
 */
export const SampleRenderer = {
  body: renderBody,
  backdrop: renderBackdrop,
};
