import * as React from 'react';
import { Command, t, LOREM, props } from '../common';
import { Test } from '../components/Test.ThreadComment';

type P = t.ICommandProps;

export const createThreadCommentProps = () => {
  return props.observable<t.IThreadCommentTestProps>({
    name: 'mary@foo.com',
    body: 'Hello world!',
  });
};

/**
 * The root of the CLI application.
 */
export const threadComment = Command.create<P>('ThreadComment', e => {
  const el = <Test data={e.props.threadComment} />;
  e.props.next({ el });
})
  .add('name', e => {
    const data = e.props.threadComment;
    data.name = e.param(0, '');
  })
  .add('body', e => {
    const data = e.props.threadComment;
    const p = e.param(0);
    const body = typeof p === 'number' ? BODY[`MARKDOWN_${p}`] : p;
    data.body = body;
  })
  .add('editor', e => {});

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

  - one
  - two
  - three
  
  ${LOREM}
  
  🌼You dig?
  
    `,
};
