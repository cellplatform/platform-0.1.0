import { map, filter } from 'rxjs/operators';
import { create as createLog, ColorFormatter } from './common';
import { ILogEvent, ILog, ILogAction, LogColor } from './types';

type ColorItem = {
  __IS_COLOR__: '__LOG_COLOR__'; // NB: Ugly field to prevent to be private/unique to log internal logic.
  color: LogColor;
  value: any;
};

const toColorItem = (color: LogColor, value: any): ColorItem => ({
  __IS_COLOR__: '__LOG_COLOR__',
  color,
  value,
});

/**
 * Creates a client log.
 */
export function create(): ILog {
  const color: ColorFormatter = (color, items): ColorItem => toColorItem(color, items);

  const log: ILog = {
    ...createLog({ color }),
  };

  // Run the log events through a formatter that converts the
  // log items into pretty colors.
  const formatter = map<ILogAction, ILogAction>((e) => {
    if (e.type === 'LOG' || e.type === 'GROUP') {
      const output = format(e.payload as ILogEvent);
      return { ...e, payload: { ...e.payload, output } };
    } else {
      return e;
    }
  });
  log.events$ = log.events$.pipe(formatter);

  // Finish up.
  return log;
}

/**
 * Create default log that writes to the console.
 */
export const log = create();
export default log;

const events$ = log.events$
  .pipe(filter(() => !log.silent))
  .pipe(filter(() => Boolean(global.console)));

events$
  // Logging.
  .pipe(filter((e) => e.type === 'LOG'))
  .pipe(map((e) => e.payload as ILogEvent))
  .subscribe((e) => {
    const { level, output } = e;
    console[level].apply(console, output); // eslint-disable-line
  });

events$
  // Clear console.
  .pipe(filter((e) => e.type === 'CLEAR'))
  .subscribe((e) => console.clear()); // eslint-disable-line

events$
  // Group.
  .pipe(filter((e) => e.type === 'GROUP'))
  .pipe(map((e) => e.payload as ILogEvent))
  .subscribe((e) => console.group.apply(console, e.output)); // eslint-disable-line

events$
  // End group.
  .pipe(filter((e) => e.type === 'UNGROUP'))
  .subscribe((e) => console.groupEnd()); // eslint-disable-line

/**
 * INTERNAL
 */
const isColorItem = (item: any) => (item ? item.__IS_COLOR__ === '__LOG_COLOR__' : false);

const isSimpleValue = (value: any) =>
  typeof value === 'boolean' || typeof value === 'string' || typeof value === 'number';

function format(e: ILogEvent) {
  const hasColor = e.items.some((item) => isColorItem(item));
  return hasColor ? formatColors(e) : e.items;
}

function formatColors(e: ILogEvent) {
  const text: string[] = [];
  const colors: string[] = [];
  const rest: any[] = [];
  let colorsStopped = false;
  e.items.forEach((item) => {
    const isColor = isColorItem(item);
    const value = isColor ? (item as ColorItem).value : item;
    if (!colorsStopped && isSimpleValue(value)) {
      text.push(isColor ? `%c${value}` : `%c${item}`);
      colors.push(isColor ? `color:${cssColor(item.color)};` : `color:black;`);
    } else {
      colorsStopped = true;
      rest.push(value);
    }
  });

  return [text.join(' '), ...colors, ...rest];
}

function cssColor(color: LogColor) {
  switch (color) {
    case 'white':
      return '#F0F0F0';
    case 'gray':
      return '#ACACAC';
    case 'red':
      return '#E70600';
    case 'blue':
      return '#0679FF';
    case 'magenta':
      return '#FF3B9A';
    case 'green':
      return '#529E00';
    case 'yellow':
      return '#FF9F00';
    case 'cyan':
      return '#00ADDC';
    default:
      return color;
  }
}
