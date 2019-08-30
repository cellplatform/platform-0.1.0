import * as React from 'react';

import { GlamorValue, loader, t } from '../common';

const DEFAULT = {
  MODULE: '.sys.shell',
};

export type ILoaderProps = {
  theme?: t.ShellTheme;
  splash?: t.SplashFactory;
  loadDelay?: number;
  style?: GlamorValue;
};

export class Loader extends React.PureComponent<ILoaderProps> {
  private loader = loader.Loader.create();

  /**
   * [Lifecycle]
   */
  constructor(props: ILoaderProps) {
    super(props);
    this.loader
      // Configure the <Shell> as the default component.
      .add(DEFAULT.MODULE, async e => {
        const Shell = (await import('../Shell')).Shell;
        return <Shell />;
      });
  }

  /**
   * [Render]
   */
  public render() {
    return (
      <loader.LoaderShell
        loader={this.loader}
        splash={this.props.splash}
        theme={this.props.theme}
        defaultModule={DEFAULT.MODULE}
        loadDelay={this.props.loadDelay}
        style={this.props.style}
      />
    );
  }
}
