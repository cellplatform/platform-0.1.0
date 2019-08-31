import * as React from 'react';
import { loader, t, Shell } from '../common';

const DEFAULT = {
  MODULE: '.sys.shell',
};

export type ILoaderProps = {
  theme?: t.ShellTheme;
  splash?: t.SplashFactory;
  loadDelay?: number;
};

export class Loader extends React.PureComponent<ILoaderProps> {
  private shell = Shell.singleton;

  /**
   * [Lifecycle]
   */
  constructor(props: ILoaderProps) {
    super(props);
    this.shell.loader
      // Configure the shell <Root> as the default component.
      .add(DEFAULT.MODULE, async e => {
        const Root = (await import('../Root')).Root;
        return <Root shell={this.shell} />;
      });
  }

  /**
   * [Render]
   */
  public render() {
    return (
      <loader.LoaderShell
        loader={this.shell.loader}
        splash={this.props.splash}
        theme={this.props.theme}
        defaultModule={DEFAULT.MODULE}
        loadDelay={this.props.loadDelay}
      />
    );
  }
}
