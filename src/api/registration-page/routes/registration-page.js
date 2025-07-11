'use strict';

/**
 * registration-page router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/registration-pages/check-family-member/:mobileNumber',
      handler: 'registration-page.checkFamilyMember',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};
