
module.exports = {
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: '30d',
  },
  cors: {
    origin: ['http://localhost:5173', 'https://demo.gahoishakti.in', 'https://api.gahoishakti.in'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
    headers: ['Content-Type', 'Authorization', 'Origin', 'Accept']
  }
};