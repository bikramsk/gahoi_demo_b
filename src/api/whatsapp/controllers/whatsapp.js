'use strict';

const fetch = require('node-fetch'); 
module.exports = {
  async sendMessage(ctx) {
    const { number, message } = ctx.request.body;

    if (!number || !message) {
      return ctx.badRequest('Missing number or message');
    }

    try {
      const response = await fetch('https://www.wpsenders.in/api/sendMessage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ number, message }),
      });

      const data = await response.json();

      if (!data.status) {
        return ctx.badRequest('Failed to send message: ' + (data.message || 'Unknown error'));
      }

      return ctx.send({ status: true, message: 'Message sent successfully' });
    } catch (err) {
      return ctx.internalServerError('Error sending WhatsApp message: ' + err.message);
    }
  },
};
