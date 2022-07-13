import React from 'react';

import { css, CssValue, DEFAULT, FC, FIELDS, pkg, PropList, Text, t } from './common';
import { toDeploymentResponse } from './ModuleInfo.deployment';

export type ModuleInfoProps = {
  fields?: t.ModuleInfoFields[];
  data?: t.ModuleInfoData;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  style?: CssValue;
};

const View: React.FC<ModuleInfoProps> = (props) => {
  const { width, minWidth = 230, maxWidth, fields = FIELDS, data = DEFAULT.data } = props;

  const secret = (hidden: boolean) => {
    const fontSize = PropList.DEFAULTS.fontSize;
    const token = data.token;
    return {
      data: <Text.Secret text={token} hidden={hidden} fontSize={fontSize} />,
      clipboard: () => token,
    };
  };

  const items = PropList.builder<t.ModuleInfoFields>()
    .field('Module', { label: 'Module', value: `${pkg.name}@${pkg.version}` })
    .field('Module.Name', { label: 'Name', value: pkg.name })
    .field('Module.Version', { label: 'Version', value: pkg.version })
    .field('Token.API', { label: 'API Token', value: secret(false) })
    .field('Token.API.Hidden', { label: 'API Token', value: secret(true) })
    .field('Deploy.Team', { label: 'Team', value: data.deploy?.team ?? '—' })
    .field('Deploy.Project', { label: 'Project', value: data.deploy?.project ?? '—' })
    .field('Deploy.Domain', { label: 'Domain (Alias)', value: data.deploy?.domain ?? '—' })
    .field('Deploy.Response', () => toDeploymentResponse(data.deploy?.response))
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

/**
 * Export
 */
type Fields = {
  DEFAULT: typeof DEFAULT;
  FIELDS: typeof FIELDS;
};
export const ModuleInfo = FC.decorate<ModuleInfoProps, Fields>(
  View,
  { DEFAULT, FIELDS },
  { displayName: 'ModuleInfo' },
);
