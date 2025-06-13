module.exports = {
  async sendSMS(ctx) {
    try {
      const { message, number } = ctx.request.body;

      const formData = new URLSearchParams();
      formData.append('api_key', 'S4YKGP5ZB9Q2J8LIDNM6OACTX'); 
      formData.append('message', message);
      formData.append('number', number);
      formData.append('route', '1');

      const response = await fetch('https://www.wpsenders.in/api/sendMessage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send SMS');
      }

      return data;
    } catch (error) {
      console.error('SMS API Error:', error.message);
      ctx.throw(500, error.message);
    }
  }
};