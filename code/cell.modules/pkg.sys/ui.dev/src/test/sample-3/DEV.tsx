import React from 'react';
import { DevActions } from '../..';
import { Component, ComponentProps } from './Component';
import { COLORS, t } from '../../common';

type Ctx = { theme: 'dark' | 'light' };

const label = 'sample-3';
const DARK: t.ActionHandlerSettingsArgs = {
  layout: {
    label,
    border: 0.2,
    cropmarks: 0.2,
    background: 0.1,
    labelColor: 0.5,
  },
  host: { background: COLORS.DARK },
};

const LIGHT: t.ActionHandlerSettingsArgs = {
  layout: {
    label,
    border: -0.1,
    cropmarks: -0.2,
    background: 1,
    labelColor: -0.5,
  },
  host: { background: -0.04 },
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('test/sample-3')
  .context((prev) => {
    if (prev) return prev;
    return { theme: 'dark' };
  })

  .items((e) => {
    e.title('theme');
    e.button('dark', (e) => (e.ctx.theme = 'dark'));
    e.button('light', (e) => (e.ctx.theme = 'light'));
    e.hr();
  })

  .subject((e) => {
    const theme = e.ctx.theme;
    e.settings(theme === 'dark' ? DARK : LIGHT);
    e.render(<Component theme={theme} />);
  });

export default actions;
