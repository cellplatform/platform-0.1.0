import QRCode from 'qrcode';

(async () => {
  const URL = 'https://news.ycombinator.com';
  const code = await QRCode.toString(URL);

  console.log(URL);
  console.log(code);

  console.log('Hello world!!! 🌼🌳🚀🐞');
  console.log('__CELL__', __CELL__);
})();
