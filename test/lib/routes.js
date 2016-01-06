var http = require('http');

module.exports = {
  '/': function (req, res) {
    res.writeHead(
      200,
      http.STATUS_CODES[200], {
        'Content-Type': 'text/html',
      });
    res.write('');
    res.end();
  },
};
