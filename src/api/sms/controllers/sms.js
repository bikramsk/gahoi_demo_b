module.exports = {
  async send(ctx) {
    try {
      const { message, number } = ctx.request.body;

      const formData = new URLSearchParams();
      formData.append('api_key', process.env.SMS_API_KEY);
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
      return { data };
      
    } catch (error) {
      console.error('SMS API Error:', error);
      ctx.body = { error: error.message };
      ctx.status = 500;
    }
  }
};