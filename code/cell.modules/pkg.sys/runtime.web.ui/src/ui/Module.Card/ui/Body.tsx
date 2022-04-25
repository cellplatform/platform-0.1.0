import React, { useEffect, useRef, useState } from 'react';
import { FC, color, COLORS, css, CssValue, t, Text } from '../../common';

import { Module } from '../../Module';
import { ModuleInfo } from '../../Module.Info';
import { ManifestSelector } from '../../Manifest.Selector';

import { useManifest } from '../../useManifest';

export type BodyProps = {
  bus: t.EventBus<any>;
  state: t.ModuleCardBodyState;
  style?: CssValue;
};

/**
 * <Body>
 */
export const View: React.FC<BodyProps> = (props) => {
  const { bus, state } = props;
  const url = (state.url || '').trim();
  const instance = { bus };

  const manifest = useManifest({ url });

  console.group('🌳 ');
  console.log('url', url);
  console.log('manifest (hook)', manifest);
  console.groupEnd();

  /**
   * [Render]
   */
  const styles = {
    base: css({
      Absolute: 0,
      overflow: 'hidden',
    }),
    placeholder: css({ Absolute: 0, Flex: 'center-center' }),
    module: css({
      Absolute: 0,
      padding: 30,
      Scroll: true,
    }),
  };

  // const elModule = url && <Module instance={instance} url={url} style={styles.module} />;

  const elModuleInfo = url && (
    <div {...styles.module}>
      <ModuleInfo manifestUrl={url} manifest={manifest.json} />
    </div>
  );
  // const elManifestSelector = url && <ManifestSelector manifestUrl={url} style={styles.module} />;

  const elPlaceholder = !url && (
    <div {...styles.placeholder}>
      <Text.Syntax
        fontSize={24}
        fontWeight={'bold'}
        monospace={true}
      >{`{ Module Loader }`}</Text.Syntax>
    </div>
  );

  return (
    <div {...css(styles.base, props.style)}>
      {elPlaceholder}
      {elModuleInfo}
    </div>
  );
};

/**
 * Render (entry)
 */
type R = t.CmdCardRender<t.ModuleCardBodyState>;
const render: R = (e) => {
  console.log('render ModuleCard (Body):', e); // TEMP 🐷
  // e.
  return <View bus={e.bus} state={e.state.current} />;
};

/**
 * Export
 */
type Fields = { render: R };
export const Body = FC.decorate<BodyProps, Fields>(
  View,
  { render },
  { displayName: 'ModuleCardBody' },
);
