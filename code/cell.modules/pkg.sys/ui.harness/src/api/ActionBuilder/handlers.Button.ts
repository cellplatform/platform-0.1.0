import { format, t } from '../../common';

/**
 * A Button configurator.
 */
export function ButtonConfig(params: any[]) {
  const LABEL = 'Unnamed';
  const item: t.ActionItemButton = { type: 'button', label: LABEL };

  const config: t.ActionButtonConfigArgs<any> = {
    label(value) {
      item.label = format.string(value, { trim: true }) || LABEL;
      return config;
    },
    description(value) {
      item.description = format.string(value, { trim: true });
      return config;
    },
    onClick(handler) {
      item.onClick = handler;
      return config;
    },
  };

  if (typeof params[0] === 'function') {
    params[0](config);
  } else {
    config.label(params[0]).onClick(params[1]);
  }

  return { item, config };
}
