import React, { useEffect, useRef, useState } from 'react';
import { Color, COLORS, css, CssValue, t, CmdCard } from './common';

export type FsCardProps = {
  instance: t.FsCardInstance;
  showAsCard?: boolean;
  style?: CssValue;
};

export const FsCard: React.FC<FsCardProps> = (props) => {
  const { instance } = props;
  return <CmdCard instance={instance} showAsCard={props.showAsCard} style={props.style} />;
};
