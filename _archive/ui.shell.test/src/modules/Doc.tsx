import { Button } from '@platform/ui.button';
import { Page } from '@platform/ui.shell.doc';
import * as React from 'react';

import { css, shell, t } from '../common';

export const init: t.ShellImportInit = async args => {
  const { shell } = args;
  shell.state.body.el = <Doc />;
};

const LOREM =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque nec quam lorem. Praesent fermentum, augue ut porta varius, eros nisl euismod ante, ac suscipit elit libero nec dolor. Morbi magna enim, molestie non arcu id, varius sollicitudin neque. In sed quam mauris. Aenean mi nisl, elementum non arcu quis, ultrices tincidunt augue. Vivamus fermentum iaculis tellus finibus porttitor. Nulla eu purus id dolor auctor suscipit. Integer lacinia sapien at ante tempus volutpat.';

export class Doc extends React.PureComponent {
  public static contextType = shell.Context;
  public context!: t.IShellContext;

  /**
   * [Render]
   */
  public render() {
    const styles = {
      base: css({
        Absolute: 0,
        Flex: 'horizontal-center-center',
      }),
      inner: css({
        position: 'relative',
        width: 820,
        height: '100%',
        boxSizing: 'border-box',
        MarginX: 30,
      }),
      version: css({
        Absolute: [8, 0, null, null],
        fontSize: 14,
        opacity: 0.4,
        userSelect: 'none',
      }),
      page: css({
        Absolute: [35, 0, 0, 0],
      }),
    };
    return (
      <div {...styles.base}>
        <div {...styles.inner}>
          <div {...styles.version}>version 0.1.2</div>
          <Page style={styles.page}>{this.renderBody()}</Page>
        </div>
      </div>
    );
  }

  private renderBody() {
    const paras = Array.from({ length: 30 }).map((v, i) => <p key={i}>{LOREM}</p>);
    return (
      <div>
        <h1>My Title</h1>
        <Button onClick={this.loadSidebar}>Load sidebar</Button>
        {paras}
      </div>
    );
  }

  /**
   * [Handlers]
   */
  private loadSidebar = () => {
    this.context.shell.load('Sidebar');
  };
}
