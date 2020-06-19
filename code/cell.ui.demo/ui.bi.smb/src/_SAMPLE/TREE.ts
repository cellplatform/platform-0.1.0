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
        label: 'Acme Inc.',
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
      ],
    },
    {
      id: 'analysis',
      props: {
        label: 'Analysis Projects',
        chevron: { isVisible: false },
        inline: { isOpen: true },
      },
      data: {
        type: 'CHAPTER',
        backgroundImage:
          'https://images.unsplash.com/photo-1472289065668-ce650ac443d2?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=3150&q=80',
      },
      children: [
        {
          id: 'analysis.latest',
          props: { label: 'Latest', icon: 'Video' },
          data: { type: 'DOC' },
          children: [
            { id: 'analysis.latest.detail', props: { label: 'Revenue Anlaysis' } },
            { id: 'analysis.latest.impact', props: { label: 'Cost Impact' } },
            { id: 'analysis.latest.trends', props: { label: 'Trends Sportlight' } },
            { id: 'analysis.latest.insight', props: { label: 'Insights and Recommendations' } },
            { id: 'analysis.latest.volatility', props: { label: 'Month on Month Volatility' } },
          ],
        },
        {
          id: 'analysis.recent',
          props: { label: 'Recent', icon: 'Video' },
          data: { type: 'DOC' },
          children: [
            { id: 'analysis.recent.detail', props: { label: 'Details' } },
            { id: 'analysis.recent.examples', props: { label: 'Examples' } },
          ],
        },
        {
          id: 'analysis.archive',
          props: { label: 'Archive', icon: 'Video' },
          data: { type: 'DOC' },
          children: [
            { id: 'analysis.archive.detail', props: { label: 'Details' } },
            { id: 'analysis.archive.examples', props: { label: 'Examples' } },
          ],
        },
      ],
    },
    {
      id: 'engagement',
      props: {
        label: 'Engagement',
        chevron: { isVisible: false },
        inline: { isOpen: false },
      },
      data: {
        type: 'CHAPTER',
        backgroundImage:
          'https://images.unsplash.com/photo-1553448540-fe069f7c95bf?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=3150&q=80',
      },

      children: [
        { id: 'engagement.agreements', props: { label: 'Agreements' } },
        { id: 'engagement.billing', props: { label: 'Billing' } },
        { id: 'engagement.people', props: { label: 'People / Roles' } },
      ],
    },
    {
      id: 'settings',
      props: {
        label: 'Settings',
        chevron: { isVisible: false },
        inline: { isOpen: false },
      },
      children: [
        { id: 'settings.auth', props: { label: 'Authorization' } },
        { id: 'settings.feeds', props: { label: 'Feeds' } },
      ],
      data: {
        type: 'CHAPTER',
        backgroundImage:
          'https://images.unsplash.com/photo-1470790376778-a9fbc86d70e2?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1849&q=80',
      },
    },
  ],
};
