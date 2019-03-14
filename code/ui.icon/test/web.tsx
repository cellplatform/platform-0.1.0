import '@babel/polyfill';
import '../node_modules/@platform/css/reset.css';

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { css } from '../src/common';

import { ImageSprite } from '../src';
import { IconGrid } from '../src/components.test';
import { Icons, IIconProps } from './Icons';

const SAMPLE = require('./images/ImageSprite.test/sample.png');
const SAMPLE2x = require('./images/ImageSprite.test/sample@2x.png');

const Test = () => {
  const styles = {
    base: css({ padding: 30 }),
  };

  const icons = Object.keys(Icons).map(name => ({ name, icon: Icons[name] }));

  return (
    <div {...styles.base}>
      <ImageSprite width={20} height={15} src={SAMPLE} total={{ x: 1, y: 2 }} />
      <IconGrid icons={icons} />
    </div>
  );
};

const el = <Test />;
ReactDOM.render(el, document.getElementById('root'));
