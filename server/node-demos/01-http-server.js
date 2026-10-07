// Experiment 7: a plain Node HTTP server (no Express)
// run: node 01-http-server.js   then open http://localhost:4000
const http = require('http');

const server = http.createServer((req, res) => {
  console.log(req.method, req.url);

  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Sri Ma Academy - plain Node server');
  } else if (req.url === '/players') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify([{ name: 'Rahul' }, { name: 'Aman' }]));
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(4000, () => console.log('Listening on http://localhost:4000'));
