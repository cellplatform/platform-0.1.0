import qrcode from 'qrcode';

(async () => {
  const URL = 'https://news.ycombinator.com/';
  const code = await qrcode.toString(URL);

  console.log(URL);
  console.log(code);

  try {
    console.log('__CELL_ENV__', __CELL_ENV__);
  } catch (error) {
    console.log('error', error);
  }
})();
