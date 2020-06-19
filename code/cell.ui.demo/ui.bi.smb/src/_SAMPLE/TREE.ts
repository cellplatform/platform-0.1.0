import { INode } from './types';

export const SIMPLE: INode = {
  id: 'root',
  props: {
    label: 'Sheet',
    icon: 'Video',
    header: { isVisible: false },
  },
  data: {
    type: 'ROOT',
    backgroundImage:
      'https://images.unsplash.com/photo-1465056836041-7f43ac27dcb5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=3151&q=80',
  },
  children: [
    {
      id: 'intro',
      props: {
        label: 'Welcome',
        marginTop: 12,
        chevron: { isVisible: false },
        inline: { isOpen: true },
      },
      data: { type: 'CHAPTER' },
      children: [
        {
          id: 'intro.what',
          props: { label: 'What', icon: 'Face' },
          data: { type: 'DOC', video: 'https://vimeo.com/306591184' },
        },
        {
          id: 'intro.who',
          props: { label: 'Who', icon: 'Face' },
          data: { type: 'DOC' },
        },
        {
          id: 'intro.why',
          props: { label: 'Why', icon: 'Face' },
          data: { type: 'DOC' },
        },
        {
          id: 'intro.files',
          props: { label: 'Download', icon: 'Box' },
        },
      ],
    },
    {
      id: 'training',
      props: {
        label: 'Training Programme',
        chevron: { isVisible: false },
        inline: { isOpen: true },
      },
      data: {
        type: 'CHAPTER',
        backgroundImage:
          'https://images.unsplash.com/photo-1525663018617-37753d540108?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1534&q=80',
      },
      children: [
        {
          id: 'training.purpose',
          props: { label: 'Purpose', icon: 'Video' },
          data: { type: 'DOC', video: 'https://vimeo.com/298559243' },
          children: [
            { id: 'training.purpose.detail', props: { label: 'Details' } },
            { id: 'training.purpose.examples', props: { label: 'Examples' } },
          ],
        },
        {
          id: 'training.segment',
          props: { label: 'Customer Segments', icon: 'Video' },
          data: {
            type: 'DOC',
            video: 'https://vimeo.com/297287021',
            backgroundImage:
              'https://images.unsplash.com/photo-1442323794357-25b2ec110967?ixlib=rb-1.2.1&auto=format&fit=crop&w=3300&q=80',
          },
        },
      ],
    },
  ],
};
