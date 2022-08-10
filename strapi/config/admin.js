module.exports = ({ env }) => ({
  apiToken: {
    salt: env('API_TOKEN_SALT', '8ztsp661bop8824j8umr96skg5kx79xb'),
  },
  auth: {
    secret: env('ADMIN_JWT_SECRET', '025935686065ccf661d183c8180e8394'),
  },
});
