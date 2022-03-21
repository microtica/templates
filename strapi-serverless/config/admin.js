module.exports = ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET', '05e2ae251ce8320c6d7656ed129419d4'),
  },
});
