import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t, ManifestUrl, slug } from '../../common';

type InstanceId = string;

export type ModuleProps = {
  bus: t.EventBus;
  url: t.ManifestUrl;
  id?: InstanceId;
  style?: CssValue;
};

export const Module: React.FC<ModuleProps> = (props) => {
  const { bus } = props;

  const target = useRef(slug());

  const url = ManifestUrl.parse(props.url || '');
  console.log('url', url);

  /**
   * Render
   */
  const styles = { base: css({}) };
  return <div {...css(styles.base, props.style)}>ModuleEntry</div>;
};
