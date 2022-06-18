import { t } from './common';

export const Util = {
  defaultState(): t.CmdBarState {
    return {
      text: '',
      textbox: { pending: false, spinning: false, placeholder: 'command' },
    };
  },
};
