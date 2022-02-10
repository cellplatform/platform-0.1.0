import React from 'react';
import { DevActions, ObjectView } from 'sys.ui.dev';
import { Label, PeerLabelProps, NetworkLabelProps } from '..';

type K = '<Label.Peer>' | '<Label.Network>';
const Kinds: K[] = ['<Label.Peer>', '<Label.Network>'];

type Ctx = {
  props: PeerLabelProps | NetworkLabelProps;
  debug: { kind: K; emptyValue: boolean };
};

const getUri = (kind: K) => {
  if (kind === '<Label.Network>') return 'network:ckzgo8ay9003w3e5zy5fq0gmj';
  if (kind === '<Label.Peer>') return 'peer:ckzdck7q200643e5z6mt57iul';
  return 'error:unknown';
};

const DEFAULT = { id: 'peer:ckzdck7q200643e5z6mt57iul' };

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.Label')
  .context((e) => {
    if (e.prev) return e.prev;

    const kind: K = '<Label.Peer>';
    const ctx: Ctx = {
      props: {
        id: getUri(kind),
        isCopyable: true,
      },
      debug: { kind, emptyValue: false },
    };
    return ctx;
  })

  .init(async (e) => {
    const { ctx, bus } = e;
  })

  .items((e) => {
    e.title('Props');

    e.boolean('isCopyable', (e) => {
      if (e.changing) e.ctx.props.isCopyable = e.changing.next;
      e.boolean.current = e.ctx.props.isCopyable;
    });

    e.hr();
  })

  .items((e) => {
    e.title('Debug');

    e.boolean('empty value', (e) => {
      if (e.changing) e.ctx.debug.emptyValue = e.changing.next;
      e.boolean.current = e.ctx.debug.emptyValue;
    });

    e.select((config) => {
      config
        .view('buttons')
        .title('kind')
        .items(Kinds)
        .initial(config.ctx.debug.kind)
        .pipe((e) => {
          if (e.changing) e.ctx.debug.kind = e.changing?.next[0].value;
        });
    });

    e.hr();
    e.component((e) => {
      const data = e.ctx.props;
      return <ObjectView name={'props'} data={data} style={{ MarginX: 15 }} fontSize={10} />;
    });
  })

  .subject((e) => {
    const { debug, props } = e.ctx;
    const { kind, emptyValue } = debug;

    e.settings({
      host: { background: -0.04 },
      layout: {
        cropmarks: -0.2,
      },
    });

    const id = emptyValue ? '' : getUri(kind);

    if (kind === '<Label.Peer>') {
      e.render(<Label.Peer {...props} id={id} />);
    }

    if (kind === '<Label.Network>') {
      e.render(<Label.Network {...props} id={id} />);
    }
  });

export default actions;
