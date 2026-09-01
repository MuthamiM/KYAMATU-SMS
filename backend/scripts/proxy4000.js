import http from 'http';

const TARGET_PORT = 5001;
const TARGET_HOST = '127.0.0.1';
const PORT = 4000;

const server = http.createServer((req, res) => {
  const options = {
    hostname: TARGET_HOST,
    port: TARGET_PORT,
    path: req.url,
    method: req.method,
    headers: {
      ...req.headers,
      host: `127.0.0.1:${TARGET_PORT}`,
      'x-forwarded-host': req.headers.host || 'api.mftechnologies.org',
      'x-forwarded-proto': 'https'
    }
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on('error', (err) => {
    console.error(`[Proxy Error -> 5001]: ${err.message}`);
    if (!res.headersSent) {
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: 'Backend unreachable on port 5001' }));
    }
  });

  req.pipe(proxyReq, { end: true });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Transparent Proxy listening on http://0.0.0.0:${PORT} -> forwarding to port ${TARGET_PORT}`);
});
