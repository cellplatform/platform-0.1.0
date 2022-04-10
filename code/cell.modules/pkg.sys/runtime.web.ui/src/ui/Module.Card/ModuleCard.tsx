import React, { useEffect, useRef, useState } from 'react';
import { FC, color, COLORS, css, CssValue, t, CmdCard, constants } from './common';
import { ModuleCardController as Controller } from './ModuleCard.Controller';

/**
 * Types
 */
export type ModuleCardProps = {
  instance: t.ModuleCardInstance;
  state?: t.ModuleCardState;
  style?: CssValue;
  onChange?: (e: t.ModuleCardState) => void;
};

/**
 * Component
 */
export const View: React.FC<ModuleCardProps> = (props) => {
  const { instance } = props;

  const controller = CmdCard.State.useController({
    instance,
    initial: props.state,
    enabled: props.state === undefined,
    onChange: props.onChange,
    controller: Controller,
  });

  /**
   * [Render]
   */
  return <CmdCard instance={instance} state={controller.state} style={props.style} />;
};

/**
 * Export
 */
type Fields = {
  constants: typeof constants;
  Controller: typeof Controller;
};
export const ModuleCard = FC.decorate<ModuleCardProps, Fields>(
  View,
  { constants, Controller },
  { displayName: 'ModuleCard' },
);
