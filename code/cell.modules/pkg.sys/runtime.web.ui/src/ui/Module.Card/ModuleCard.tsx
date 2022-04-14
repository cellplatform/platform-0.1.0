import React from 'react';

import { CmdCard, constants, CssValue, FC, t } from './common';
import { ModuleCardController as Controller } from './ModuleCard.Controller';

/**
 * Types
 */
export type ModuleCardProps = {
  instance: t.ModuleCardInstance;
  state?: t.CmdCardState;
  style?: CssValue;
  onChange?: (e: t.CmdCardState) => void;
};

/**
 * Component
 */
export const View: React.FC<ModuleCardProps> = (props) => {
  const { instance } = props;

  const controller = CmdCard.useController({
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
