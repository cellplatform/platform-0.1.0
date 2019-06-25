export type TreeTheme = 'DARK' | 'LIGHT';
export type ThemeColor = string | number;

export type ITreeTheme = {
  name: string;
  node: ITreeNodeTheme;
  header: ITreeHeaderTheme;
  bg: ThemeColor;
  borderColor: ThemeColor;
  spinner: ThemeColor;
};

export type ITreeNodeTheme = {
  labelColor: ThemeColor;
  chevronColor: ThemeColor;
  borderTopColor: ThemeColor;
  borderBottomColor: ThemeColor;
  statusBadge: {
    color: ThemeColor;
    bgColor: ThemeColor;
    borderColor: ThemeColor;
    textShadow: ThemeColor;
  };
  selected: {
    bgColor: ThemeColor;
  };
};

export type ITreeHeaderTheme = {
  bg: ThemeColor;
  titleColor: ThemeColor;
  borderBottomColor: ThemeColor;
  textShadow: ThemeColor;
  chevronColor: ThemeColor;
};
