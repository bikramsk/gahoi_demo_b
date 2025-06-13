module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/send-sms',  
      config: {
        auth: false,
        policies: []
      }
    }
  ]
};