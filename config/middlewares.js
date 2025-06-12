module.exports = [
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': ["'self'", 'data:', 'blob:', 'https:'],
          'media-src': ["'self'", 'data:', 'blob:', 'https:'],
          upgradeInsecureRequests: null,
        },
      },
      jwtSecret: process.env.JWT_SECRET,
    },
  },
  {
    name: 'strapi::cors',
    config: {
      enabled: true,
      headers: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
      origin: ['http://localhost:5173', 'https://demo.gahoishakti.in', 'https://api.gahoishakti.in'],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
      credentials: true,
    }
  },
  'strapi::poweredBy',
  'strapi::logger',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];







// module.exports = [
//   'strapi::errors',
//   {
//     name: 'strapi::security',
//     config: {
//       contentSecurityPolicy: {
//         useDefaults: true,
//         directives: {
//           'connect-src': ["'self'", 'https:'],
//           'img-src': ["'self'", 'data:', 'blob:', 'https:'],
//           'media-src': ["'self'", 'data:', 'blob:', 'https:'],
//           upgradeInsecureRequests: null,
//         },
//       },
//       jwtSecret: process.env.JWT_SECRET,
//       jwtExpiration: process.env.JWT_EXPIRATION,
//     },
//   },
//   {
//     name: 'strapi::cors',
//     config: {
//       enabled: true,
//       headers: ['Content-Type', 'Authorization', 'Origin', 'Accept', 'authorization'],
//       origin: ['https://demo.gahoishakti.in', 'http://localhost:5173', 'https://api.gahoishakti.in'],
//       credentials: true,
//       methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
//     }
//   },
//   'strapi::poweredBy',
//   'strapi::logger',
//   'strapi::query',
//   'strapi::body',
//   'strapi::session',
//   'strapi::favicon',
//   'strapi::public',
// ];






// module.exports = [
//   'strapi::errors',
//   {
//     name: 'strapi::security',
//     config: {
//       contentSecurityPolicy: {
//         useDefaults: true,
//         directives: {
//           'connect-src': ["'self'", 'https:'],
//           'img-src': ["'self'", 'data:', 'blob:', 'https:'],
//           'media-src': ["'self'", 'data:', 'blob:', 'https:'],
//           upgradeInsecureRequests: null,
//         },
//       },
//     },
//   },
//   {
//     name: 'strapi::cors',
//     config: {
//       enabled: true,
//       headers: ['Content-Type', 'Authorization', 'Origin', 'Accept', 'authorization'],
//       origin: ['https://demo.gahoishakti.in', 'http://localhost:5173']
//     }
//   },
//   'strapi::poweredBy',
//   'strapi::logger',
//   'strapi::query',
//   'strapi::body',
//   'strapi::session',
//   'strapi::favicon',
//   'strapi::public',
// ];








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
