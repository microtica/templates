module.exports = ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET', '025935686065ccf661d183c8180e8394'),
  },
});
