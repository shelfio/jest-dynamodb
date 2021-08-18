/*
  This is copied from https://github.com/sindresorhus/wait-for-localhost/blob/v3.3.0/index.js
  With 1 change
  We rely on status code 400 instead of 200 to ensure local DDB is up and running
 */

const http = require('http');

const waitForLocalhost = port => {
  return new Promise(resolve => {
    const retry = () => setTimeout(main, 200);

    const main = () => {
      const request = http.request({method: 'GET', port, path: '/'}, response => {
        if (response.statusCode === 400) {
          return resolve();
        }

        retry();
      });

      request.on('error', retry);
      request.end();
    };

    main();
  });
};

module.exports = waitForLocalhost;
