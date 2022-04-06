import React, { useEffect, useRef, useState } from 'react';
import { FC, color, COLORS, css, CssValue, t, CmdCard } from './common';
import { ModuleCardEvents as Events } from './Events';
import { State } from './State';

/**
 * Types
 */
export type ModuleCardProps = {
  instance: t.ModuleCardInstance;
  state?: t.ModuleCardState;
  style?: CssValue;
};

/**
 * Component
 */
export const View: React.FC<ModuleCardProps> = (props) => {
  const { instance } = props;

  /**
   * TODO 🐷
   */

  const { state } = State.useController({
    enabled: props.state === undefined, // NB: pass-through if not enabled (controlled externally)
    instance: props.instance,
    initial: props.state,
    // bus,
    // onChange: args.state.onChange,
  });

  /**
   * [Render]
   */
  return <CmdCard instance={instance} state={state?.card} style={props.style} />;
};

/**
 * Export
 */
type Fields = {
  Events: typeof Events;
  State: typeof State;
};
export const ModuleCard = FC.decorate<ModuleCardProps, Fields>(
  View,
  { Events, State },
  { displayName: 'ModuleCard' },
);
