/**
 * [Events]
 */
export type WebpackEvent = IWebpackFooEvent;

/**
 * TEMP 🐷
 */
export type IWebpackFooEvent = {
  type: 'Webpack/focus';
  payload: IWebpackFoo;
};
export type IWebpackFoo = { foo: 123 };
