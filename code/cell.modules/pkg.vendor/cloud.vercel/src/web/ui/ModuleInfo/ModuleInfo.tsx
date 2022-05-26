import React from 'react';

import { css, CssValue, pkg, PropList, Text } from '../common';
import { DEFAULT } from './constants';
import * as k from './types';
import { toDeploymentResponse } from './ModuleInfo.deployment';

export type ModuleInfoProps = {
  fields?: k.ModuleInfoFields[];
  data?: k.ModuleInfoData;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  style?: CssValue;
};

export const ModuleInfo: React.FC<ModuleInfoProps> = (props) => {
  const { width, minWidth = 230, maxWidth, fields = DEFAULT.FIELDS, data = DEFAULT.DATA } = props;

  const secret = (hidden: boolean) => {
    const fontSize = PropList.DEFAULTS.fontSize;
    const token = data.token;
    return {
      data: <Text.Secret text={token} hidden={hidden} fontSize={fontSize} />,
      clipboard: () => token,
    };
  };

  const items = PropList.builder<k.ModuleInfoFields>()
    .field('Module', { label: 'Module', value: `${pkg.name}@${pkg.version}` })
    .field('Module.Name', { label: 'Name', value: pkg.name })
    .field('Module.Version', { label: 'Version', value: pkg.version })
    .field('Token.API', { label: 'API Token', value: secret(false) })
    .field('Token.API.Hidden', { label: 'API Token', value: secret(true) })
    .field('Deploy.Domain', { label: 'Domain', value: data.deployment?.domain ?? '-' })
    .field('Deploy.Response', () => toDeploymentResponse(data.deployment?.response))
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
