import React, { useEffect, useRef, useState } from 'react';
import { FC, color, COLORS, css, CssValue, t, Text } from '../../common';

export type BackdropProps = {
  bus: t.EventBus<any>;
  state: t.ModuleCardBackdropState;
  style?: CssValue;
};

/**
 * <Backdrop>
 */
export const View: React.FC<BackdropProps> = (props) => {
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
      >{`{ Module Backdrop }`}</Text.Syntax>
    </div>
  );
};

type R = t.CmdCardRender<t.ModuleCardBackdropState>;
const render: R = (e) => {
  console.log('render ModuleCard (Backdrop):', e); // TEMP 🐷
  return <View bus={e.bus} state={e.state.current} />;
};

/**
 * Export
 */
type Fields = { render: R };
export const Backdrop = FC.decorate<BackdropProps, Fields>(
  View,
  { render },
  { displayName: 'ModuleCardBackdrop' },
);
