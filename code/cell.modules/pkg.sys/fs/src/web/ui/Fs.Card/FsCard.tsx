import React, { useEffect, useRef, useState } from 'react';
import { Color, COLORS, css, CssValue, t, CmdCard, FC, DEFAULT, THEMES } from './common';
import { FsCardController } from './logic/Controller';

export type FsCardProps = {
  instance: t.FsViewInstance;
  showAsCard?: boolean;
  theme?: t.FsCardTheme;
  style?: CssValue;
};

/**
 * TODO 🐷 WORK-IN-PROGRESS
 *
 * - needs refactor of how the <Cmd.Card> setup occurs
 *   specifically to do with the way the Local ("filesystem")
 *    behavior logic( and corresponding <Views>) is initialized
 *    and composed into the root `<Cmd.Card>-controller(hook)`
 *
 * BUGS
 *
 * - keyboard selection not working within hosted <Fs.PathList>
 */

/**
 * Component
 */
const View: React.FC<FsCardProps> = (props) => {
  const { instance } = props;

  const controller = CmdCard.useController({
    instance,
    controller: FsCardController,
    initial: CmdCard.defaultState({
      body: { state: { count: 123 } as any },
    }),
  });

  return (
    <CmdCard
      instance={instance}
      state={controller.state}
      showAsCard={props.showAsCard}
      style={props.style}
    />
  );
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
