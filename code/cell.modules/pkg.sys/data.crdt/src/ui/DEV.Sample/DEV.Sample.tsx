import React from 'react';

import { List, css, CssValue, t } from './common';
import { DocCard } from './DEV.DocCard';
import { SimpleDoc } from './DEV.types';

export type SampleProps = {
  instance: t.FsViewInstance;
  docs?: t.CrdtDocEvents<SimpleDoc>[];
  style?: CssValue;
};

export const Sample: React.FC<SampleProps> = (props) => {
  const { instance, docs = [] } = props;
  if (docs.length === 0) return null;

  /**
   * [Render]
   */
  const styles = {
    base: css({}),
  };

  const elCards = (
    <List.Layout
      orientation={'x'}
      bullet={{ edge: 'far', size: 60 }}
      spacing={20}
      items={docs.map((doc) => ({ data: doc }))}
      renderers={{
        bullet: (e) => <List.Renderers.Bullet.ConnectorLines {...e} radius={25} />,
        body: (e) => {
          if (e.kind !== 'Default') return;
          return <DocCard instance={instance} index={e.index} doc={e.data} />;
        },
      }}
    />
  );

  return <div {...css(styles.base, props.style)}>{elCards}</div>;
};
