import { PageHeader, IPageHeaderProps, HeaderToolClickEvent } from './Page.Header';
import { PageVideo, IPageVideoProps } from './Page.Video';
import { PageContainer, IPageContainerProps } from './Page.Container';
import { PageBody, IPageBodyProps } from './Page.Body';
import { PageText, ITextProps } from './Page.Text';

export {
  IPageHeaderProps,
  HeaderToolClickEvent,
  IPageVideoProps,
  IPageContainerProps,
  IPageBodyProps,
  ITextProps,
};

export const Page = {
  Header: PageHeader,
  Video: PageVideo,
  Container: PageContainer,
  Body: PageBody,

  Text: PageText,
  Headline: PageText.Headline,
  Paragraph: PageText.Paragraph,
};
