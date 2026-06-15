const http = require('https');

function testFetch(url, referer) {
  const options = {
    headers: {}
  };
  if (referer) {
    options.headers['Referer'] = referer;
  }
  options.headers['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

  console.log(`\nFetching ${url} with Referer: ${referer || 'none'}`);
  http.get(url, options, (res) => {
    console.log(`Status code: ${res.statusCode}`);
    console.log('Headers:', res.headers);
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => console.log('Body:', body));
  }).on('error', (e) => {
    console.error(e);
  });
}

const targetUrl = 'https://img.poki-cdn.com/resize/180/180/50/7470e68382cadd95e3521065b2615253/vortellas-dress-up-logo.png';
testFetch(targetUrl, null);
testFetch(targetUrl, 'https://poki.com/');
