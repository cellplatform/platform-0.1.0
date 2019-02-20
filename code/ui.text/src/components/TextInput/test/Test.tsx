import {
  React,
  GlamorValue,
  Actions,
  css,
  color,
  constants,
  ActionButton,
  ObjectView,
} from '../../../test';
import { TextInput, ITextInputProps, TextInputChangeEvent } from '..';
import { Text } from '../../Text';

const LOREM =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque nec quam lorem. Praesent fermentum, augue ut porta varius, eros nisl euismod ante, ac suscipit elit libero nec dolor. Morbi magna enim, molestie non arcu id, varius sollicitudin neque. In sed quam mauris. Aenean mi nisl, elementum non arcu quis, ultrices tincidunt augue. Vivamus fermentum iaculis tellus finibus porttitor. Nulla eu purus id dolor auctor suscipit. Integer lacinia sapien at ante tempus volutpat.';

// type P = ITextInputProps;
type S = ITestState;

const actions = Actions
  // Test actions.
  .header('value')
  .add('short ("hello")', e => e.setState<S>({ value: 'hello' }))
  .add('medium', e =>
    e.setState<S>({ value: 'the quick brown fox jumps over the lazy dog.' }),
  )
  .add('long', e => e.setState<S>({ value: LOREM }))

  .header('style')
  .add('fontFamily: default (Roboto)', e =>
    e.setState<S>({ fontFamily: constants.ROBOTO.FAMILY }),
  )
  .add('fontFamily: monospace', e =>
    e.setState<S>({ fontFamily: constants.MONOSPACE.FAMILY }),
  )
  .hr()
  .add('fontSize: 16', e => e.setState<S>({ fontSize: 16 }))
  .add('fontSize: 36', e => e.setState<S>({ fontSize: 36 }));

/**
 * Test View.
 */
export type ITestProps = ITextInputProps & {
  style?: GlamorValue;
};
export interface ITestState {
  value?: string;
  fontFamily?: string;
  fontSize?: number;
  sizeInput?: { width: number; height: number };
  sizeText?: { width: number; height: number };
}
export class Test extends React.PureComponent<ITestProps, ITestState> {
  public state: ITestState = {
    value: this.props.value || 'hello',
  };

  private input: TextInput;
  private inputRef = (ref: TextInput) => (this.input = ref);

  private text: Text;
  private textRef = (ref: Text) => (this.text = ref);

  public render() {
    const valueStyle = {
      fontFamily: this.state.fontFamily,
      fontSize: this.state.fontSize,
    };
    const styles = {
      base: css({
        flex: 1,
        PaddingX: 20,
        Flex: 'vertical-stretch-stretch',
      }),
      input: css({
        borderBottom: `dashed 1px ${color.format(-0.1)}`,
      }),
      action: css({
        marginRight: 10,
      }),
      toolbar: css({
        marginTop: 10,
        Flex: 'horizontal',
      }),

      text: css({
        marginTop: 80,
      }),
    };

    return (
      <Actions
        setState={this.setState.bind(this)} // tslint:disable-line
        state={this.state}
        items={actions}
        leftWidth={300}
        padding={0}
        style={this.props.style}
      >
        <div {...styles.base}>
          <TextInput
            ref={this.inputRef}
            style={styles.input}
            valueStyle={valueStyle}
            {...this.props}
            {...this.state}
            onChange={this.handleChange}
          />
          <div {...styles.toolbar}>
            <ActionButton
              children={'measure <TextInput>'}
              onClick={this.handleMeasureInput}
              style={styles.action}
            />
            {this.state.sizeInput && <ObjectView data={this.state.sizeInput} />}
          </div>

          <Text
            ref={this.textRef}
            style={styles.text}
            fontSize={valueStyle.fontSize}
            fontFamily={valueStyle.fontFamily}
            children={this.state.value}
          />
          <div {...styles.toolbar}>
            <ActionButton
              children={'measure <Text>'}
              onClick={this.handleMeasureText}
              style={styles.action}
            />
            {this.state.sizeText && <ObjectView data={this.state.sizeText} />}
          </div>
        </div>
      </Actions>
    );
  }

  private handleChange = (e: TextInputChangeEvent) => {
    this.setState({ value: e.to });
  };

  private handleMeasureInput = () => {
    this.setState({ sizeInput: this.input.size });
  };

  private handleMeasureText = () => {
    this.setState({ sizeText: this.text.size });
  };
}
