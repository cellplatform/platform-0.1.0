import './css';
import * as React from 'react';
import { css, color, GlamorValue } from '../../common';

import { schema } from 'prosemirror-schema-basic';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

export type IEditorProps = {
  style?: GlamorValue;
};

export class Editor extends React.PureComponent<IEditorProps> {
  constructor(props: IEditorProps) {
    super(props);
  }

  public componentDidMount() {
    console.log('this.el', this.el);

    const state = EditorState.create({ schema });

    console.log('state', state);
    const view = new EditorView(this.el, { state });
  }

  /**
   * [Fields]
   */
  private el: HTMLDivElement;
  private elRef = (ref: HTMLDivElement) => (this.el = ref);

  /**
   * [Render]
   */
  public render() {
    const styles = {
      base: css({
        backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
        // flex: 1,
      }),
    };
    return <div ref={this.elRef} {...css(styles.base, this.props.style)} />;
  }
}
