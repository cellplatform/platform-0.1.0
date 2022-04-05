import React from 'react';

import { List, css, CssValue, t } from '../../common';
import { DocCard } from './DEV.DocCard';
import { SimpleDoc } from './DEV.types';

export type SampleProps = {
  docs?: t.CrdtDocEvents<SimpleDoc>[];
  style?: CssValue;
};

export const Sample: React.FC<SampleProps> = (props) => {
  const { docs = [] } = props;
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
        body: (e) => (e.kind === 'Default' ? <DocCard doc={e.data} /> : undefined),
      }}
    />
  );

  return <div {...css(styles.base, props.style)}>{elCards}</div>;
};
