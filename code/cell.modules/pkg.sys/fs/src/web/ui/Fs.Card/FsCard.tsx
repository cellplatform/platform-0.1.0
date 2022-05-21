import React, { useEffect, useRef, useState } from 'react';
import { Color, COLORS, css, CssValue, t, CmdCard, FC, DEFAULT, THEMES } from './common';

export type FsCardProps = {
  instance: t.FsViewInstance;
  showAsCard?: boolean;
  theme?: t.FsCardTheme;
  style?: CssValue;
};

/**
 * Component
 */
const View: React.FC<FsCardProps> = (props) => {
  const { instance } = props;
  return <CmdCard instance={instance} showAsCard={props.showAsCard} style={props.style} />;
};

/**
 * Export
 */

type Fields = {
  THEMES: typeof THEMES;
  DEFAULT: typeof DEFAULT;
};
export const FsCard = FC.decorate<FsCardProps, Fields>(
  View,
  { THEMES, DEFAULT },
  { displayName: 'FsCard' },
);
