import React from 'react';
import { DevActions, ObjectView } from 'sys.ui.dev';

type Ctx = {
  output?: any;
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.Text')
  .context((e) => {
    if (e.prev) return e.prev;
    const ctx: Ctx = {};
    return ctx;
  })

  .init(async (e) => {
    const { ctx, bus } = e;
  })

  .items((e) => {
    e.title('Dev');

    e.button('text to speech', (e) => {
      const text = `Hello World.`;
      const synth = window.speechSynthesis;
      const utter = new SpeechSynthesisUtterance(text);
      synth.speak(utter);
    });

    e.hr();

    e.component((e) => {
      return (
        <ObjectView
          name={'output'}
          data={e.ctx.output}
          style={{ MarginX: 15 }}
          fontSize={10}
          expandPaths={['$']}
        />
      );
    });
  })

  .subject((e) => {
    e.settings({
      host: { background: -0.04 },
      layout: {
        label: '<Text>',
        position: [150, 80],
        border: -0.1,
        cropmarks: -0.2,
        background: 1,
      },
    });
    // e.render(<Text {...e.ctx.props} />);
  });

export default actions;
