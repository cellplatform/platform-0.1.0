import React, { useEffect, useRef, useState } from 'react';
import { FC, color, COLORS, css, CssValue, t, Text } from '../../common';

export type BodyProps = {
  bus: t.EventBus<any>;
  state: t.ModuleCardBodyState;
  style?: CssValue;
};

/**
 * <Body>
 */
export const View: React.FC<BodyProps> = (props) => {
  /**
   * [Render]
   */
  const styles = {
    base: css({
      Absolute: 0,
      padding: 20,
      Flex: 'center-center',
    }),
  };

  return (
    <div {...css(styles.base, props.style)}>
      <Text.Syntax
        fontSize={24}
        fontWeight={'bold'}
        monospace={true}
      >{`{ Module Loader }`}</Text.Syntax>
    </div>
  );
};

type R = t.CmdCardRender<t.ModuleCardBodyState>;
const render: R = (e) => {
  console.log('render ModuleCard (Body):', e); // TEMP 🐷
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
