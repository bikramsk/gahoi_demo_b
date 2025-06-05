module.exports = [
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': ["'self'", 'data:', 'blob:', 'https://api.gahoishakti.in'],
        },
      },
    },
  },
  {
    name: 'strapi::cors',
    config: {
      enabled: true,
      origin: [
        'https://demo.gahoishakti.in',        
      ],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
      headers: [
        'Content-Type',
        'Authorization',
        'Origin', 
        'Accept',
        'X-Requested-With'
      ],
      keepHeaderOnError: true,
    },
  },
  'strapi::logger',
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];



// module.exports = [
//   "strapi::errors",
//   {
//     name: "strapi::cors",
//     config: {
//       enabled: true,
//       origin: ["http://localhost:5173"],
//       credentials: true,
//       methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"],
//       headers: ["Content-Type", "Authorization", "Origin", "Accept"],
//     },
//   },
//   "strapi::logger",
//   "strapi::security",
//   "strapi::poweredBy",
//   "strapi::query",
//   "strapi::body",
//   "strapi::session",
//   "strapi::favicon",
//   "strapi::public",
// ];
