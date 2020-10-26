import qrcode from 'qrcode';

(async () => {
  const url = 'http://localhost:1234';
  const code = await qrcode.toString(url);
  console.log('__dirname', __dirname);
  console.log(url);
  console.log(code);
})();
