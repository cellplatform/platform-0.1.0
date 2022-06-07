import React, { useEffect, useRef, useState } from 'react';
import { FC, Color, COLORS, css, CssValue, t, List } from '../common';
import { FsPathList } from '../../Fs.PathList';

/**
 * Types
 */
export type BodyProps = {
  instance: t.FsViewInstance;
  style?: CssValue;
};

/**
 * Component
 */
const View: React.FC<BodyProps> = (props) => {
  const { instance } = props;

  console.log('Body View', instance);

  /**
   * [Render]
   */
  const styles = {
    base: css({
      flex: 1,
      display: 'flex',
    }),
  };

  return (
    <div {...css(styles.base, props.style)}>
      <FsPathList.Stateful
        // tabIndex={-1}
        instance={instance}
        selectable={List.SelectionConfig.default}
        scrollable={true}
        droppable={true}
        style={{ flex: 1 }}
      />
    </div>
  );
};

/**
 * Renderer
 */

const render: t.CmdCardRender<t.FsCardBodyState> = (e) => {
  console.log('e', e);
  const state = e.state.current;

  return <Body instance={state.instance} />;
};

/**
 * Export
 */

type Fields = {
  render: t.CmdCardRender<t.FsCardBodyState>;
};
export const Body = FC.decorate<BodyProps, Fields>(
  View,
  { render },
  { displayName: 'FsCard.Body' },
);
