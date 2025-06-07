'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/api/check-user-mpin/:mobileNumber',
      handler: 'user-mpin.checkUserAndMPIN',
      config: {
        auth: false
      }
    },
    {
      method: 'POST',
      path: '/api/verify-mpin',
      handler: 'user-mpin.verifyMPIN',
      config: {
        auth: false
      }
    },
    {
      method: 'POST',
      path: '/api/send-whatsapp-otp',
      handler: 'user-mpin.sendWhatsAppOTP',
      config: {
        auth: false
      }
    },
    {
      method: 'POST',
      path: '/api/verify-otp',
      handler: 'user-mpin.verifyOTP',
      config: {
        auth: false
      }
    },
    {
      method: 'POST',
      path: '/api/set-mpin',
      handler: 'user-mpin.setMPIN',
      config: {
        auth: false
      }
    }
  ]
}; 