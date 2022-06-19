import React, { useEffect, useState } from 'react';

import { CmdTextbox } from '../../Cmd.Textbox';
import { css, t } from '../common';

export type TextboxProps = t.CmdBarProps & { events: t.CmdBarEvents };

export const Textbox: React.FC<TextboxProps> = (props) => {
  const styles = { base: css({ MarginX: 8 }) };

  /**
   * NOTE: A local state function is used for more immediate updates to
   *       the underlying textbox.  This is kept in sync with the controller
   *       state logic ("optimistic change") which gets overwritten if the
   *       state controller issues a value change.
   *       However immedate typing is immedately passed back into the component
   *       as the controller changes are async enough as to throw the <Input>
   *       element slightly out when typing.
   */
  const [text, setText] = useState(props.text ?? '');
  useEffect(() => {
    if (props.text !== text) setText(props.text ?? '');
  }, [props.text]); // eslint-disable-line

  return (
    <CmdTextbox
      instance={props.instance}
      theme={'Dark'}
      text={text}
      hint={props.hint}
      placeholder={props.textbox?.placeholder}
      spinner={props.textbox?.spinning}
      pending={props.textbox?.pending}
      style={css(styles.base, props.style)}
      onChange={(e) => {
        setText(e.to); // Immediate ("optimistic") local state update.
        props.onChange?.(e); // Broadcast change.
      }}
      onAction={(e) => {
        const { kind, text } = e;
        props.onAction?.(e);
        props.events.action.fire({ kind, text });
      }}
    />
  );
};
