export const devConfig = {
  port: 3000,
  database: "invoice-builder",
  secret: "qwerty",
  frontendURL: 'http://localhost:4200',
  google:{
    clientId: '243129169279-cjbh185qb3im2ov1a00v73pnuma91ilf.apps.googleusercontent.com',
    clientSecret: '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',
    callbackURL: 'http://localhost:3000/api/auth/google/callback' 
  },
  github:{
    clientId: 'Iv1.2afe570245ac3d31',
    clientSecret: '517c6feca8c693f8731ff5ec4924ecaf7d832d83',
    callbackURL: 'http://localhost:3000/api/auth/github/callback'
  },
  ethereal: {
    username: 'madelyn.kunze76@ethereal.email',
    password: 'wg7Rf4zJbCK2tQTCUH',
    host: 'smtp.ethereal.email',
    port: 587,
  }
};
