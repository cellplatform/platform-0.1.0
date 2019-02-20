import { React, describe, fake, log } from '../../test/storybook';
import { Text, Monospace } from '.';

const LOREM = fake.LOREM;
const STORY = {
  title: 'Text display',
  width: '80%',
};

const logEvent = (event: string) => (e: any) => log.info(event, e);

describe('Text (Roboto)', { ...STORY })
  .add('default', () => <Text>{LOREM}</Text>)
  .add('fontWeight (LIGHT)', () => <Text fontWeight={'LIGHT'}>{LOREM}</Text>)
  .add('fontWeight (NORMAL)', () => <Text fontWeight={'NORMAL'}>{LOREM}</Text>)
  .add('fontWeight (BOLD)', () => (
    <Text fontWeight={'BOLD'} fontSize={52} isSelectable={false}>
      My Bold Text
    </Text>
  ))
  .add('uppercase', () => <Text uppercase={true}>{LOREM}</Text>)
  .add('events', () => {
    const text = `Events: ${LOREM}`;
    return (
      <Text
        onClick={logEvent('onClick')}
        onMouse={logEvent('onMouse')}
        children={text}
      />
    );
  });

describe('Text (Monospace)', { ...STORY }).add('Monospace', () => (
  <Monospace>{LOREM}</Monospace>
));
