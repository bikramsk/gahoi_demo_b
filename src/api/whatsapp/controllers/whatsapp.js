'use strict';

const fetch = require('node-fetch'); 

module.exports = {
  async sendMessage(ctx) {
    const { number, message } = ctx.request.body;

    // Validate inputs
    if (!number || !message) {
      return ctx.badRequest('Missing number or message');
    }

    try {
      // Create x-www-form-urlencoded body
      const formData = new URLSearchParams();
      formData.append('number', number);
      formData.append('message', message);

      const response = await fetch('https://www.wpsenders.in/api/sendMessage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      });

      const contentType = response.headers.get("content-type");

      if (!contentType || !contentType.includes("application/json")) {
        const raw = await response.text();
        return ctx.badRequest(`Expected JSON but got: ${raw}`);
      }

      const data = await response.json();

      if (!data.status) {
        return ctx.badRequest('Failed to send message: ' + (data.message || 'Unknown error'));
      }

      return ctx.send({ status: true, message: 'Message sent successfully' });

    } catch (err) {
      console.error('WhatsApp send error:', err);
      return ctx.internalServerError('Error sending WhatsApp message: ' + err.message);
    }
  },
};
