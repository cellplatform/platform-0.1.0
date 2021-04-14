import React, { useState } from 'react';

import { DevActions, toObject } from 'sys.ui.dev';
import { DotTabstrip, DotTabstripProps } from './DotTabstrip';
import { toItems } from './util';
import { t, log, COLORS } from '../../common';
import { defaultValue } from '@platform/ui.image/lib/common';

const createItems = (length: number, options: { isLoaded?: boolean } = {}): t.DotTabstripItem[] => {
  const { isLoaded } = options;
  return Array.from({ length }).map((v, i) => ({ label: `item-${i + 1}`, value: i, isLoaded }));
};

type Ctx = { props: DotTabstripProps };
const INITIAL = {
  props: {
    items: createItems(5, { isLoaded: true }),
  },
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui/DotTabstrip')
  .context((e) => e.prev || INITIAL)

  .items((e) => {
    e.title('DotTabstrip');
    e.hr();

    e.button('log: props', (e) => log.info(toObject(e.ctx.props)));

    e.button('colors: default', (e) => {
      delete e.ctx.props.defaultColor;
      delete e.ctx.props.highlightColor;
      delete e.ctx.props.selectedColor;
    });

    e.button('colors: custom', (e) => {
      e.ctx.props.defaultColor = -0.1;
      e.ctx.props.highlightColor = COLORS.PINK;
      e.ctx.props.selectedColor = COLORS.CYAN;
      e.ctx.props.errorColor = COLORS.YELLOW;
    });

    e.hr(1, 0.1);

    e.button('loaded: true', (e) => {
      const props = e.ctx.props;
      props.items = toItems(props.items).map((item) => ({ ...item, isLoaded: true }));
    });

    e.button('loaded: undefined', (e) => {
      const props = e.ctx.props;
      props.items = toItems(props.items).map((item) => ({ ...item, isLoaded: undefined }));
    });

    e.hr();
  })

  .items((e) => {
    e.title('items');
    e.button('empty (undefined)', (e) => (e.ctx.props.items = undefined));
    e.button('1', (e) => (e.ctx.props.items = createItems(1, { isLoaded: true })));
    e.button('5', (e) => (e.ctx.props.items = createItems(5, { isLoaded: true })));
    e.button('10', (e) => (e.ctx.props.items = createItems(10, { isLoaded: true })));
    e.hr();
  })

  .items((e) => {
    e.title('selected');
    e.button('none (undefined)', (e) => (e.ctx.props.selected = undefined));
    e.button('first', (e) => (e.ctx.props.selected = 0));
    e.button('last', (e) => (e.ctx.props.selected = (e.ctx.props.items || []).length - 1));
    e.hr();
  })

  .items((e) => {
    e.title('error');
    e.button('none', (e) => {
      const props = e.ctx.props;
      props.items = toItems(props.items).map((item) => ({ ...item, error: undefined }));
    });
    e.button('1', (e) => {
      const items = toItems(e.ctx.props.items);
      if (items[0]) items[0].error = 'My Error';
    });
    e.button('5', (e) => {
      const items = toItems(e.ctx.props.items);
      if (items[4]) items[4].error = 'My Error';
    });
    e.hr();
  })

  /**
   * Render
   */
  .subject((e) => {
    e.settings({
      layout: { cropmarks: -0.2 },
      host: { background: -0.04 },
    });

    const Sample: React.FC<DotTabstripProps> = () => {
      const mouse = useMouse();
      const props = e.ctx.props;
      const selected = defaultValue(props.selected, mouse.selected);
      return <DotTabstrip {...props} selected={selected} onClick={mouse.onClick} />;
    };

    e.render(<Sample />);
  });

export default actions;

/**
 * Helpers
 */

function useMouse() {
  const [selected, setSelected] = useState<number | undefined>(undefined);
  const onClick: t.DotTabstripClickEventHandler = (e) => {
    setSelected(e.index);
    log.info('onClick', e);
  };
  return { onClick, selected };
}
