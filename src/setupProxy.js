const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    createProxyMiddleware('/api', {
      target: 'https://10.4.69.53',
      changeOrigin: true,
      secure: false
    })
  );
};
