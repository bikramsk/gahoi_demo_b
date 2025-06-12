'use strict';

/**
 * registration-page router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/registration-pages',
      handler: 'registration-page.find',
      config: {
        auth: {
          scope: ['api::registration-page.find']
        },
        policies: [],
        middlewares: []
      }
    },
    {
      method: 'GET',
      path: '/registration-pages/:id',
      handler: 'registration-page.findOne',
      config: {
        auth: {
          scope: ['api::registration-page.findOne']
        },
        policies: [],
        middlewares: []
      }
    }
  ]
};
