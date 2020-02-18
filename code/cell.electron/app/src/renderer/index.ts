console.log('document', document);

const url =
  'http://localhost:8080/cell:ck6bmume4000008mqhkkdaebj!A2/file/dist/index.html?def=ns:ck6h33tit000008mt36b74r2v';

const iframe = document.createElement('iframe');

iframe.width = '100%';
iframe.height = '100%';

iframe.style.position = 'absolute';
iframe.style.top = '0px';
// iframe.style.right = '0px';
// iframe.style.bottom = '0px';
iframe.style.left = '0px';

iframe.src = url;
iframe.frameBorder = 'none';

document.body.appendChild(iframe);
