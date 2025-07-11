'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::registration-page.registration-page', ({ strapi }) => ({
  async checkFamilyMember(ctx) {
    try {
      const { mobileNumber } = ctx.params;
      
      if (!mobileNumber) {
        return ctx.badRequest('Mobile number is required');
      }

      // Check if this number exists in any family member records
      const familyMemberRegistration = await strapi.db.query('api::registration-page.registration-page').findOne({
        where: {
          $or: [
            { 'family_details.father_mobile': mobileNumber },
            { 'family_details.mother_mobile': mobileNumber },
            { 'family_details.spouse_mobile': mobileNumber },
            { 'family_details.siblingDetails': { $elemMatch: { phone_number: mobileNumber } } },
            { 'family_details.childrenDetails': { $elemMatch: { phone_number: mobileNumber } } }
          ]
        },
        populate: ['family_details', 'personal_information']
      });

      if (familyMemberRegistration) {
        return {
          data: familyMemberRegistration,
          meta: {
            isExistingFamilyMember: true,
            message: 'This number is registered as a family member in an existing profile'
          }
        };
      }

      return {
        meta: {
          isExistingFamilyMember: false
        }
      };

    } catch (error) {
      console.error('Check family member error:', error);
      return ctx.badRequest('Error checking family member status');
    }
  },

  async create(ctx) {
    try {
      const mobileNumber = ctx.request.body.data?.personal_information?.mobile_number;
      
      if (!mobileNumber) {
        return await super.create(ctx);
      }

      // First check if this number exists as a primary registration
      const existingRegistration = await strapi.db.query('api::registration-page.registration-page').findOne({
        where: {
          personal_information: {
            mobile_number: mobileNumber
          }
        },
        populate: ['personal_information']
      });

      if (existingRegistration) {
        const updated = await strapi.db.query('api::registration-page.registration-page').update({
          where: { id: existingRegistration.id },
          data: ctx.request.body.data,
          populate: ['personal_information']
        });
        return { data: updated };
      }

      // Check if this number exists in any family member records
      const familyMemberRegistration = await strapi.db.query('api::registration-page.registration-page').findOne({
        where: {
          $or: [
            { 'family_details.father_mobile': mobileNumber },
            { 'family_details.mother_mobile': mobileNumber },
            { 'family_details.spouse_mobile': mobileNumber },
            { 'family_details.siblingDetails': { $elemMatch: { phone_number: mobileNumber } } },
            { 'family_details.childrenDetails': { $elemMatch: { phone_number: mobileNumber } } }
          ]
        },
        populate: ['family_details', 'personal_information']
      });

      if (familyMemberRegistration) {
        // Return the existing family profile with a special flag
        return {
          data: familyMemberRegistration,
          meta: {
            isExistingFamilyMember: true,
            message: 'This number is registered as a family member in an existing profile'
          }
        };
      }

      // If no existing registration or family member found, create new registration
      const response = await super.create(ctx);
      return response;

    } catch (error) {
      console.error('Registration error:', error);
      
      if (error.code === '23505' || error.message.includes('unique')) {
        return ctx.conflict('A registration with this mobile number already exists');
      }

      console.error('Detailed error:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        details: error.details
      });
      
      return ctx.badRequest('Registration failed', { error: error.message });
    }
  }
}));



