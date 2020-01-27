/**
 * See:
 *   - https://github.com/xyc/react-inspector
 */

import * as React from 'react';

import { css, CssValue, isPromise, DEFAULTS } from '../../common';
import { Editor } from './Editor';

import { ReactInspector, ObjectLabel, ObjectRootLabel, ObjectName, THEME } from './libs';

export type IObjectViewProps = {
  data: any;
  name?: string;
  expandLevel?: number;
  showNonenumerable?: boolean;
  expandPaths?: string | string[];
  fontSize?: number;
  theme?: 'LIGHT' | 'DARK';
  style?: CssValue;
};

export type IObjectViewState = {
  data?: any;
  isLoading?: boolean;
};

type INodeRendererOptions = {
  depth: number;
  name: string;
  data: any;
  isNonenumerable: boolean;
  expanded: boolean;
};

/**
 * Views an Object as a visual tree.
 */
export class ObjectView extends React.PureComponent<IObjectViewProps, IObjectViewState> {
  public state: IObjectViewState = {};
  private isUnmounted = false;

  public componentWillMount() {
    this.loadData();
  }

  public componentDidUpdate(prevProps: IObjectViewProps, prevState: IObjectViewState) {
    if (this.props.data !== prevProps.data && !this.isUnmounted) {
      this.loadData();
    }
  }

  public componentWillUnmount() {
    this.isUnmounted = true;
  }

  public render() {
    let { data } = this.state;
    const { name, expandLevel = 1, showNonenumerable = false, expandPaths, style } = this.props;

    if (this.state.isLoading) {
      data = 'Loading...';
    }

    return (
      <div {...css(style)}>
        <ReactInspector
          data={data}
          name={name}
          expandLevel={expandLevel}
          showNonenumerable={showNonenumerable}
          expandPaths={expandPaths}
          theme={this.theme}
          nodeRenderer={this.renderNode}
        />
      </div>
    );
  }

  private get theme() {
    const { fontSize = DEFAULTS.FONT_SIZE } = this.props;
    const fontSizeCss = `${fontSize}px`;
    const lineHeightCss = '1.5em';
    return {
      ...this.baseTheme,
      BASE_BACKGROUND_COLOR: 'transparent',
      BASE_FONT_SIZE: fontSizeCss,
      TREENODE_FONT_SIZE: fontSizeCss,
      BASE_LINE_HEIGHT: lineHeightCss,
      TREENODE_LINE_HEIGHT: lineHeightCss,
    };
  }

  private get baseTheme() {
    const { theme = 'LIGHT' } = this.props;
    switch (theme) {
      case 'LIGHT':
        return THEME.LIGHT;
      case 'DARK':
        return THEME.DARK;
      default:
        throw new Error(`Theme '${theme}' not supported.`);
    }
  }

  private async loadData() {
    let { data } = this.props;
    if (isPromise(data)) {
      this.setState({ isLoading: true });
      data = await data;
    }
    this.setState({ data, isLoading: false });
  }

  public renderNode = (props: INodeRendererOptions) => {
    const { depth, name, data, isNonenumerable } = props;
    if (depth === 0) {
      // NB: Don't show preview of object on root.
      return this.renderRootNode(props);
    } else {
      return <ObjectLabel name={name} data={data} isNonenumerable={isNonenumerable} />;
    }
  };

  public renderRootNode = (props: INodeRendererOptions) => {
    const { data, name } = props;
    const rootData = Array.isArray(data) ? data : {};
    return <ObjectRootLabel name={name} data={rootData} />;
  };

  public renderEditorNode = (props: INodeRendererOptions) => {
    const { name, isNonenumerable } = props;
    return (
      <span>
        <ObjectName name={name} dimmed={isNonenumerable} />
        <span>: </span>
        <Editor fontSize={this.props.fontSize} />
      </span>
    );
  };
}
