import React from 'react';
import { DevActions } from 'sys.ui.dev';
import { TextEditor, ITextEditorProps as TextEditorProps } from '@platform/ui.editor';
import { DEFAULT } from './DEV.const';
import { css } from '../../common';

type Ctx = { props: TextEditorProps };

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.editor/TextEditor')
  .context((prev) => {
    if (prev) return prev;
    return {
      props: {
        value: DEFAULT.MARKDOWN,
      },
    };
  })

  .items((e) => {
    //
  })

  .subject((e) => {
    e.settings({
      layout: {
        border: -0.1,
        cropmarks: -0.2,
        background: 1,
        label: '<TextEditor>',
        position: [150, 80],
      },
      host: { background: -0.04 },
    });

    const styles = {
      base: css({
        Absolute: 0,
        Scroll: true,
        overflow: 'hidden',
        paddingBottom: 80,
        PaddingX: 30,
      }),
    };

    const el = (
      <div {...styles.base}>
        <TextEditor {...e.ctx.props} />
      </div>
    );

    e.render(el);
  });

export default actions;
