module.exports = [
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': [
            "'self'", 
            'data:', 
            'blob:', 
            'https://api.gahoishakti.in',
            'https://demo.gahoishakti.in',
            'https://gahoi-shakti.web.app'
          ],
        },
      },
    },
  },
  {
    name: 'strapi::cors',
    config: {
      enabled: true,
      origin: [
        'http://localhost:5173',           // Local development
        'https://demo.gahoishakti.in',     // Demo 
        'https://gahoi-shakti.web.app',    // Firebase hosting
        'https://api.gahoishakti.in',      
        'https://www.gahoishakti.in',      // Production with www
        'https://gahoishakti.in'           // Production without www
      ],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
      headers: [
        'Content-Type',
        'Authorization',
        'Origin',
        'Accept',
        'X-Requested-With',
        'Access-Control-Allow-Origin',
        'Access-Control-Allow-Headers',
        'Access-Control-Allow-Methods'
      ],
      keepHeaderOnError: true,
      credentials: true  
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
