module.exports = ({ env }) => ({
  cors: {
    enabled: true,
    origin: env('CORS_ORIGIN', 'https://demo.gahoishakti.in'),
    credentials: env('CORS_CREDENTIALS', true),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
    headers: '*',
    expose: ['WWW-Authenticate', 'Server-Authorization'],
  },
});