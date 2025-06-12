'use strict';

/**
 * registration-page controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = {
  async find(ctx) {
    try {
      const { query } = ctx;
      
      // Log incoming request details
      console.log('Registration pages request:', {
        filters: query.filters,
        headers: ctx.request.headers,
      });

      // Ensure user is authenticated
      if (!ctx.state.user) {
        return ctx.unauthorized('You must be logged in');
      }

      // Get mobile number from query
      const mobileNumber = query?.filters?.personal_information?.mobile_number?.$eq;
      
      if (!mobileNumber) {
        return ctx.badRequest('Mobile number is required');
      }

      // Find registration data
      const entity = await strapi.service('api::registration-page.registration-page').find({
        ...query,
        populate: {
          personal_information: true,
          family_details: true,
          biographical_details: true,
          work_information: true,
          additional_details: true
        }
      });

      // Log response size
      console.log('Response data size:', {
        count: entity.results?.length,
        hasData: !!entity.results?.[0]
      });

      return entity;
    } catch (error) {
      console.error('Registration pages error:', error);
      return ctx.internalServerError('An error occurred');
    }
  }
};
