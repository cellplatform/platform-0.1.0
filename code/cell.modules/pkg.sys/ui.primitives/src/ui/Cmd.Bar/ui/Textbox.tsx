import React from 'react';

import { CmdTextbox } from '../../Cmd.Textbox';
import { css, t } from '../common';

export type TextboxProps = t.CmdBarProps & { events: t.CmdBarEvents };

export const Textbox: React.FC<TextboxProps> = (props) => {
  const styles = { base: css({ MarginX: 8 }) };

  return (
    <CmdTextbox
      instance={props.instance}
      theme={'Dark'}
      text={props.text ?? ''}
      hint={props.hint}
      placeholder={props.textbox?.placeholder}
      spinner={props.textbox?.spinning}
      pending={props.textbox?.pending}
      style={css(styles.base, props.style)}
      onChange={(e) => {
        props.onChange?.(e);
        props.events.text.onChange___(e.to);
      }}
      onAction={(e) => {
        const { kind, text } = e;
        props.onAction?.(e);
        props.events.action.fire({ kind, text });
      }}
    />
  );
};
