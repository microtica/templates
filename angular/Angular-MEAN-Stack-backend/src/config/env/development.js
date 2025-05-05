export const devConfig = {
  port: 3000,
  database: "invoice-builder",
  secret: "qwerty",
  frontendURL: 'http://localhost:4200',
  google:{
    clientId: '', // enter your google clicentId
    clientSecret: '', // enter your google clientSecret
    callbackURL: ''  // enter your google callbackURL
  },
  github:{
    clientId: '', // enter your github clicentId
    clientSecret: '', // enter your github clientSecret
    callbackURL: '' // enter your github callbackURL
  },
  ethereal: {
    username: '', // enter your ethereal username
    password: '', // enter your ethereal password
    host: '', // enter your ethereal host number
    port: '', // enter your ethereal port number
  }
};
