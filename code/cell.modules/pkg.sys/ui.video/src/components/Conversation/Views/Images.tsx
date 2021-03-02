import React, { useEffect, useState } from 'react';
import { Subject } from 'rxjs';
import { filter, takeUntil, map } from 'rxjs/operators';

import { Spinner } from '../../Primitives';
import { COLORS, css, CssValue, events, t } from '../common';
import { DotSelector, DotSelectorItem } from '../DotSelector';
import { Image } from './Image';
import { Scale } from './Scale';

export type ImagesProps = {
  bus: t.EventBus<any>;
  paths?: string[];
  selected?: string;
  zoom?: number;
  offset?: { x: number; y: number };
  style?: CssValue;
  onSelect?: (e: { path?: string }) => void;
};

export const Images: React.FC<ImagesProps> = (props) => {
  const { paths = [], onSelect, selected } = props;
  const bus = props.bus.type<t.PeerEvent>();

  const [isOver, setIsOver] = useState<boolean>(false);
  const [items, setItems] = useState<DotSelectorItem[]>([]);
  const [isAltPressed, setIsAltPressed] = useState<boolean>(false);

  const getSelected = () => items.find((item) => item.value === selected);
  const getSelectedIndex = () => items.findIndex((item) => item.value === selected);
  const isEmpty = items.length === 0;
  const isSelectedLoading = isEmpty ? false : !getSelected()?.isLoaded;

  const setSelected = (path?: string) => {
    if (onSelect) onSelect({ path });
  };

  useEffect(() => {
    const toFilename = (path: string) => path.substring(path.lastIndexOf('/') + 1);
    const items: DotSelectorItem[] = paths.map((value) => ({ value, label: toFilename(value) }));
    setItems(items);
  }, [paths]); // eslint-disable-line

  useEffect(() => {
    const dispose$ = new Subject<void>();
    const key$ = events.keyPress$.pipe(takeUntil(dispose$));

    const keyup$ = key$.pipe(
      takeUntil(dispose$),
      filter((e) => !e.isPressed),
    );

    const keydown$ = key$.pipe(
      takeUntil(dispose$),
      filter((e) => e.isPressed),
    );

    key$.subscribe((e) => {
      if (!e.isPressed) setIsAltPressed(false);
      if (e.isPressed) setIsAltPressed(e.altKey);
    });

    keydown$.pipe(filter((e) => e.key === 'ArrowLeft')).subscribe(selecPrevious);
    keydown$.pipe(filter((e) => e.key === 'ArrowRight')).subscribe(selectNext);
    keydown$.pipe(filter((e) => e.key === 'Home')).subscribe(selectFirst);
    keydown$.pipe(filter((e) => e.key === 'End')).subscribe(selectLast);

    const number$ = keydown$.pipe(
      filter((e) => e.code.startsWith('Numpad') || e.code.startsWith('Digit')),
      map((e) => ({ ...e, key: e.code.replace(/^Numpad/, '').replace(/^Digit/, '') })),
      map((e) => ({ ...e, number: parseInt(e.key, 10) })),
      filter((num) => !Number.isNaN(num)),
    );

    number$.pipe(filter((e) => e.altKey)).subscribe((e) => {
      if (e.number === 0) {
        reset();
      } else {
        const item = items[e.number - 1];
        if (item) setSelected(item.value);
      }
    });

    return () => dispose$.next();
  }, [items, isOver]); // eslint-disable-line

  const reset = () => {
    bus.fire({
      type: 'Conversation/publish',
      payload: { data: { zoom: undefined, offset: undefined } },
    });
  };

  const changeItem = (path: string, props: Partial<DotSelectorItem>) => {
    setItems(items?.map((item) => (item.value === path ? { ...item, ...props } : item)));
  };

  const selecPrevious = () => {
    const index = Math.max(0, getSelectedIndex() - 1);
    setSelected(items[index]?.value);
  };

  const selectNext = () => {
    const index = Math.min(items.length - 1, getSelectedIndex() + 1);
    setSelected(items[index]?.value);
  };

  const selectFirst = () => setSelected(items[0]?.value);
  const selectLast = () => setSelected(items[items.length - 1]?.value);

  const styles = {
    base: css({}),
    body: css({
      Flex: 'center-center',
      Absolute: 0,
      paddingBottom: 20,
      PaddingX: 20,
    }),

    backgroundLoad: css({ visibility: 'hidden' }),

    img: css({
      height: '80%',
    }),

    dotSelector: css({
      Absolute: [null, null, 10, 30],
    }),

    spinner: css({
      Absolute: 0,
      Flex: 'center-center',
      pointerEvents: 'none',
    }),

    scale: css({
      Absolute: [10, 10, null, null],
    }),
  };

  const images = paths.map((path) => {
    return {
      path,
      el: (
        <Image
          bus={bus}
          key={path}
          src={path}
          style={styles.img}
          zoom={props.zoom}
          offset={props.offset}
          onLoadComplete={() => changeItem(path, { isLoaded: true })}
        />
      ),
    };
  });

  const currentImage = images.find((image) => image.path === selected);

  const elSpinner = isSelectedLoading && (
    <div {...styles.spinner}>
      <Spinner />
    </div>
  );

  return (
    <div
      {...css(styles.base, props.style)}
      onMouseEnter={() => setIsOver(true)}
      onMouseLeave={() => setIsOver(false)}
    >
      <div {...styles.backgroundLoad}>{images.map((item) => item.el)}</div>

      <div {...styles.body}>{currentImage?.el}</div>

      <DotSelector
        items={items}
        selected={selected}
        style={styles.dotSelector}
        onClick={(e) => setSelected(e.value)}
        highlightColor={COLORS.PINK}
        selectedColor={isOver ? COLORS.PINK : -0.4}
      />

      {elSpinner}
      {isAltPressed && <Scale style={styles.scale} />}
    </div>
  );
};
