import React from 'react';

import { css, CssValue, pkg, PropList } from '../common';
import { ModuleInfoConstants, DEFAULT } from './constants';
import * as k from './types';

export type ModuleInfoProps = {
  fields?: k.ModuleInfoFields[];
  config?: k.ModuleInfoConfig;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  style?: CssValue;
};

export const ModuleInfo: React.FC<ModuleInfoProps> = (props) => {
  const {
    width,
    minWidth = 230,
    maxWidth,
    fields = DEFAULT.FIELDS,
    config = DEFAULT.CONFIG,
  } = props;

  const Text = {
    Token(props: { token?: string; hidden?: boolean }) {
      /**
       * TODO 🐷
       */
      const styles = {
        base: css({ backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */ }),
      };
      return (
        <div {...styles.base}>
          {props.hidden ? 'HIDDEN' : 'SECRET'} {props.token}
        </div>
      );
    },
  };

  const items = PropList.builder<k.ModuleInfoFields>()
    .field('Module', { label: 'Module', value: `${pkg.name}@${pkg.version}` })
    .field('Module.Name', { label: 'Name', value: pkg.name })
    .field('Module.Version', { label: 'Version', value: pkg.version })
    .field('Token.API', {
      label: 'API Token',
      value: <Text.Token token={config.token} hidden={false} />,
    })
    .field('Token.API.Hidden', {
      label: 'API Token',
      value: <Text.Token token={config.token} hidden={true} />,
    })
    .items(fields);

  /**
   * [Render]
   */
  const styles = { base: css({ position: 'relative', width, minWidth, maxWidth }) };

  return (
    <div {...css(styles.base, props.style)}>
      <PropList items={items} defaults={{ clipboard: false }} />
    </div>
  );
};
