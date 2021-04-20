import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t, Hr, Automerge } from './common';
import { DevObject } from './DEV.Object';

export type DevSampleProps = {
  bus: t.EventBus<any>;
  docs: Automerge.DocSet<t.Doc>;
  style?: CssValue;
};

export const DevSample: React.FC<DevSampleProps> = (props) => {
  const { docs } = props;
  const bus = props.bus.type<t.CrdtEvent>();

  const PADDING = { CARD: 25 };

  const styles = {
    base: css({
      flex: 1,
      Flex: 'vertical-stretch-stretch',
      boxSizing: 'border-box',
      position: 'relative',
    }),
    body: {
      base: css({
        flex: 1,
        position: 'relative',
      }),
      scroll: css({
        Absolute: 0,
        Scroll: true,
        paddingBottom: 80,
        paddingRight: PADDING.CARD,
      }),
    },
    object: css({ display: 'inline-block' }),
  };

  const ids = Array.from(props.docs.docIds);
  const elObjects = Array.from({ length: ids.length }).map((v, index) => {
    const doc = docs.getDoc(ids[index]);
    return (
      <DevObject
        key={index}
        index={index}
        bus={bus}
        doc={doc}
        margin={[PADDING.CARD, 0, 0, PADDING.CARD]}
        style={styles.object}
      />
    );
  });

  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.body.base}>
        <div {...styles.body.scroll}>{elObjects}</div>
      </div>
    </div>
  );
};
