import React, { useEffect, useState } from 'react';

import { Automerge, Button, Card, css, CssValue, PropList, PropListItem, t } from './common';

export type DevObjectProps = {
  bus: t.EventBus<any>;
  id: string;
  docs: t.Docs;
  style?: CssValue;
  margin?: t.CssEdgesInput;
};

export const DevObject: React.FC<DevObjectProps> = (props) => {
  const { bus, docs, id } = props;

  const [count, setCount] = useState<number>(0);
  const redraw = () => setCount((prev) => prev + 1);

  const doc = docs.getDoc(id);

  useEffect(() => {
    docs.registerHandler((id) => {
      if (id === props.id) redraw();
    });
  }, []); // eslint-disable-line

  const styles = {
    base: css({ position: 'relative', fontSize: 14 }),
  };

  const increment = (by: number) => {
    const next = Automerge.change<t.Doc>(doc, (draft) => (draft.count = draft.count + by));
    docs.setDoc(id, next);
  };

  const state: PropListItem[] = [
    { label: 'actor', value: Automerge.getActorId(doc) },
    { label: 'count', value: doc.count },
    {
      label: 'change',
      value: (
        <div>
          <Button
            label={'increment'}
            onClick={() => increment(1)}
            margin={[null, 15, null, null]}
          />
          <Button label={'decrement'} onClick={() => increment(-1)} />
        </div>
      ),
    },
  ];

  return (
    <div {...css(styles.base, props.style)}>
      <Card margin={props.margin} padding={[10, 20, 10, 10]} shadow={false} width={{ min: 310 }}>
        <PropList title={`Object: ${id}`} items={state} />
      </Card>
    </div>
  );
};
