import React, { useEffect, useRef, useState } from 'react';

import { Automerge, Card, css, CssValue, PropList, PropListItem, t } from './common';

export type DevObjectProps = {
  bus: t.EventBus<any>;
  doc: t.Doc;
  index: number;
  style?: CssValue;
  margin?: t.CssEdgesInput;
};

export const DevObject: React.FC<DevObjectProps> = (props) => {
  const { doc } = props;

  const styles = {
    base: css({
      position: 'relative',
      fontSize: 14,
    }),
  };

  const state: PropListItem[] = [
    { label: 'id', value: Automerge.getActorId(doc) },
    { label: 'count', value: doc.count },
    { label: 'text', value: doc.text },
  ];

  return (
    <div {...css(styles.base, props.style)}>
      <Card margin={props.margin} padding={[16, 20]} shadow={false} width={{ min: 300 }}>
        <PropList title={`Object ${props.index + 1}`} items={state} />
      </Card>
    </div>
  );
};
