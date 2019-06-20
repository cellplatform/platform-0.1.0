import { css } from '../../common';

export const CLASS_NAME = 'p-cli-input';

const styles = {
  input: { lineHeight: 1 },
};

css.global(styles, { prefix: `.${CLASS_NAME}` });
