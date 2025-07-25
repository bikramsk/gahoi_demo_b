// module.exports = ({ env }) => ({
//  url: env('PUBLIC_URL', 'https://api.gahoishakti.in'), 
//  host: '0.0.0.0', 
//  port: env.int('PORT', 1337),
//  app: {
//    keys: env.array('APP_KEYS'),
//  },
//  admin: {
//    url: '/admin', 
//    serveAdminPanel: true,
    
//  },
// });



 module.exports = ({ env }) => ({
 host: env('HOST', '0.0.0.0'),
   port: env.int('PORT', 1337),
  app: {
     keys: env.array('APP_KEYS'),
   },
   webhooks: {
     populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
   },
 });



