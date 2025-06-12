module.exports = ({ env }) => ({
  cors: {
    enabled: true,
    origin: ['https://demo.gahoishakti.in'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
    headers: [
      'Content-Type',
      'Authorization',
      'Origin',
      'Accept',
      'authorization',
      'Access-Control-Allow-Origin',
      'Access-Control-Allow-Credentials',
      'Access-Control-Allow-Headers',
      'Access-Control-Allow-Methods'
    ],
    expose: ['WWW-Authenticate', 'Server-Authorization'],
  },
});