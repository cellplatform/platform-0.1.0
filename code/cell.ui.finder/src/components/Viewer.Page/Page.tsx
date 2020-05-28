import { PageHeader, IPageHeaderProps, HeaderToolClickEvent } from './Page.Header';
import { PageVideo, IPageVideoProps } from './Page.Video';
import { PageContainer, IPageContainerProps } from './Page.Container';

export { IPageHeaderProps, HeaderToolClickEvent, IPageVideoProps, IPageContainerProps };

export const Page = {
  Header: PageHeader,
  Video: PageVideo,
  Container: PageContainer,
};
