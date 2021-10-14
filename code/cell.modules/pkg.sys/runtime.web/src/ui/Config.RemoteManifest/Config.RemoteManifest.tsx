import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t } from '../../common';

export type ConfigRemoteManifestProps = { style?: CssValue };

export const ConfigRemoteManifest: React.FC<ConfigRemoteManifestProps> = (props) => {
  const styles = { base: css({}) };
  return <div {...css(styles.base, props.style)}>ConfigRemoteManifest</div>;
};
