import React from 'react';

import { Card } from '../../Card';
import { ObjectView } from '../../ObjectView';
import { css, CssValue, k } from '../common';

export type BodyDefaultProps = k.BulletRendererArgs & {
  width?: string | number;
  minWidth?: string | number;
  expandPaths?: string[];
  style?: CssValue;
};

export const BodyDefault: React.FC<BodyDefaultProps> = (props) => {
  const { kind, index, total, data, orientation, bullet, spacing, width, minWidth } = props;

  if (kind === 'Spacing') return null;

  // Sample data view.
  const meta = { kind, index, total, orientation, bullet, spacing };
  const obj = { meta, data };

  /**
   * [Render]
   */
  const styles = {
    base: css({ position: 'relative', width, minWidth }),
    card: css({
      paddingLeft: 15,
      paddingRight: 20,
      PaddingY: 10,
    }),
    count: css({
      Absolute: [2, 5, null, null],
      fontSize: 10,
      opacity: 0.2,
    }),
  };

  return (
    <div {...css(styles.base, props.style)}>
      <Card style={styles.card}>
        <ObjectView
          name={'t.BulletItemArgs'}
          data={obj}
          fontSize={10}
          expandPaths={props.expandPaths ?? ['$', '$.data']}
        />
        <div {...styles.count}>{index + 1}</div>
      </Card>
    </div>
  );
};
