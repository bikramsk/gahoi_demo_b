module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/api/send-sms',
      handler: 'sms.sendSMS',
      config: {
        policies: [],
        auth: false
      }
    }
  ]
};