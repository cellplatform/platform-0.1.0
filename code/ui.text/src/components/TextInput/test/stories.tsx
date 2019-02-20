import {
  React,
  describe,
  color,
  log,
  constants,
} from '../../../test/storybook';
import { TextInput, ITextInputProps } from '../TextInput';
import { TextInputChangeEvent, masks } from '..';
import { Test } from './Test';

const TITLE = 'A simple text input field.';
const STORY = { title: TITLE, width: '80%' };

describe('TextInput', STORY).add('TextInput', () => <TestWrapper />);

describe('TextInput/props', STORY)
  .add('value', () => <TestWrapper value={'Hello'} />)
  .add('disabled', () => <TestWrapper isEnabled={false} value={'Hello'} />)
  .add('disabled, empty', () => <TestWrapper isEnabled={false} />)
  .add('number only', () => (
    <TestWrapper mask={masks.isNumeric} value={'1234'} />
  ))
  .add('border', () => {
    const style = {
      padding: '5px 10px',
      border: `solid 1px rgba(0, 0, 0, 0.2)`,
      borderRadius: 3,
    };
    return (
      <TestWrapper
        value={'My Value'}
        placeholder={'My Placeholder'}
        style={style}
      />
    );
  })
  .add('password', () => (
    <TestWrapper isPassword={true} placeholder={'Password'} />
  ))
  .add('selection background', () => (
    <TestWrapper
      selectionBackground={'red'}
      value={'hello'}
      focusAction={'SELECT'}
    />
  ))
  .add('end of focus', () => {
    return <TestWrapper value={'hello'} focusAction={'END'} />;
  });

describe('TextInput', {
  title: TITLE,
  width: '100%',
  height: '100%',
  hr: false,
  padding: 30,
  flex: true,
}).add('Measure', () => <Test />);

describe('TextInput/autoSize', {
  title: TITLE,
})
  .add('Roboto - minWidth: 80', () => {
    return (
      <TestWrapper
        value={'1'}
        autoSize={true}
        minWidth={80}
        maxWidth={250}
        maxLength={200}
      />
    );
  })
  .add('Roboto - minWidth: placeholder width', () => {
    return <TestWrapper autoSize={true} maxLength={200} />;
  })
  .add('Monospace', () => {
    return (
      <TestWrapper
        value={'1'}
        valueStyle={{ fontFamily: constants.MONOSPACE.FAMILY }}
        autoSize={true}
        maxWidth={250}
        maxLength={200}
      />
    );
  });

/**
 * COMPONENT
 */
export interface ITestWrapperState {
  text: string;
}

export class TestWrapper extends React.PureComponent<
  Partial<ITextInputProps>,
  ITestWrapperState
> {
  public state: ITestWrapperState = { text: this.props.value || '' };

  public componentDidMount() {
    // NOTE:  Tests that the text-input changes when the property
    //        updates from an external setting, not just typing.
    // setTimeout(() => {
    //   this.setState({ text: 'New Value' });
    // }, 1000);
  }

  public render() {
    const valueStyle = {
      fontSize: 32,
      lineHeight: 1.5,
      letterSpacing: -0.8,
      color: '#2D9CDB',
    };
    const placeholderStyle = {
      color: color.format(-0.2),
      italic: true,
    };

    return (
      <TextInput
        valueStyle={valueStyle}
        placeholder={'My Placeholder'}
        placeholderStyle={placeholderStyle}
        width={'100%'}
        // minWidth={300}
        maxLength={13}
        onChange={this.handleChange}
        onEnter={this.handleEnter}
        onFocus={this.handleFocus}
        onBlur={this.handleBlur}
        focusOnLoad={true}
        focusAction={'SELECT'}
        {...this.props as ITextInputProps}
        value={this.state.text}
      />
    );
  }

  private handleEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    log.info('!! onEnter', e);
  };

  private handleFocus = () => log.info('!! onFocus');
  private handleBlur = () => log.info('!! onBlur');

  private handleChange = (e: TextInputChangeEvent) => {
    log.info('!! onChange', e);
    this.setState({ text: e.to });
  };
}
