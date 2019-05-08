import * as React from 'react';
import { Command, t, LOREM, props, PEOPLE } from '../common';
import { Test } from '../components/Test.ThreadComment';

type P = t.ICommandProps;

export const createThreadCommentProps = () => {
  return props.observable<t.IThreadCommentTestProps>({
    person: PEOPLE.MARY,
    body: BODY.MARKDOWN_2,
    isEditing: false,
  });
};

/**
 * The root of the CLI application.
 */
export const threadComment = Command.create<P>('ThreadComment', e => {
  const el = <Test data={e.props.threadCommentProps} />;
  e.props.next({ el });
})
  .add('name', e => {
    const data = e.props.threadCommentProps;
    const value = e.param(0, '');
    data.person = { id: value };
  })
  .add('body', e => {
    const data = e.props.threadCommentProps;
    const p = e.param(0);
    const body = typeof p === 'number' ? BODY[`MARKDOWN_${p}`] : p;
    data.body = body;
  })
  .add('edit-mode', e => {
    const data = e.props.threadCommentProps;
    data.isEditing = true;
  })
  .add('read-mode', e => {
    const data = e.props.threadCommentProps;
    data.isEditing = false;
  });

/**
 * [Sample]
 */
const BODY = {
  MARKDOWN_1: `
  🌼You dig?
    `,

  MARKDOWN_2: `
  Hey **Bob**
  
  ${LOREM}

  ${LOREM}

  - one
  - two
  - three
  
  ${LOREM}
  
  🌼You dig?
  
    `,
};
