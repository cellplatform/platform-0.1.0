import React, { useEffect, useState } from 'react';
import { ObjectView } from 'sys.ui.dev';

import { color, css, CssValue, t } from '../../common';

import { Card } from 'sys.ui.primitives/lib/ui/Card';
import { Button } from 'sys.ui.primitives/lib/ui.ref/button/Button';
import { Doc } from './DEV.types';

export type SampleCardProps = {
  doc: t.CrdtDocEvents<Doc>;
  style?: CssValue;
};

export const SampleCard: React.FC<SampleCardProps> = (props) => {
  const [doc, setDoc] = useState<Doc>(props.doc.current);

  /**
   * [Lifecycle]
   */
  useEffect(() => {
    // Update local state when the document has been updated.
    props.doc.changed$.subscribe((e) => setDoc(e.doc.next as Doc));
  }, [props.doc]); // eslint-disable-line

  /**
   * [Render]
   */
  const styles = {
    base: css({
      minWidth: 180,
      padding: 5,
      fontSize: 13,
    }),
    object: css({ margin: 5 }),
    toolbar: css({
      marginTop: 15,
      padding: 5,
      Flex: 'horizontal-stretch-spaceBetween',
      borderTop: `solid 1px ${color.format(-0.1)}`,
    }),
  };
  return (
    <Card style={css(styles.base, props.style)}>
      <ObjectView data={doc} style={styles.object} />
      <div {...styles.toolbar}>
        <Button onClick={() => props.doc.change((d) => d.count++)}>Increment</Button>
        <Button onClick={() => props.doc.change((d) => d.count--)}>Decrement</Button>
      </div>
    </Card>
  );
};
