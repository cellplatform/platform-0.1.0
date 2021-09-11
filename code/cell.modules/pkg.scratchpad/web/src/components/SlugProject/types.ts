type VideoId = number;
type Milliseconds = number;

export type SlugDoc = {
  id: string;
  video: VideoId;
  images: SlugImage[];
};

export type SlugImage = {
  startAt: Milliseconds;
  src: string;
};
