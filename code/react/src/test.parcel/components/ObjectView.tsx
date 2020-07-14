import { css, CssValue } from '@platform/css';
import * as React from 'react';

const m = require('react-inspector'); // eslint-disable-line
const ReactInspector = m.default as React.ComponentClass<any>;

export type IObjectViewProps = {
  name?: string;
  data?: any;
  expandLevel?: number;
  expandPaths?: string[];
  style?: CssValue;
};

export class ObjectView extends React.PureComponent<IObjectViewProps> {
  /**
   * [Render]
   */
  public render() {
    const styles = {
      base: css({}),
    };
    const data = this.props.data || {};
    const { expandLevel = 1, expandPaths = [] } = this.props;

    return (
      <div {...css(styles.base, this.props.style)}>
        <ReactInspector data={data} expandLevel={expandLevel} expandPaths={expandPaths} />
      </div>
    );
  }
}
