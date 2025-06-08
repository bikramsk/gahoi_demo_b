'use strict';

const crypto = require('crypto');
const { createCoreController } = require('@strapi/strapi').factories;

const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString(); 
};

const isValidMobileNumber = (mobileNumber) => {
  return /^[0-9]{10}$/.test(mobileNumber);
};

const isValidMPIN = (mpin) => {
  return /^[0-9]{4}$/.test(mpin);
};

const hashMPIN = (mpin) => {
  return crypto.createHash('sha256').update(mpin).digest('hex');
};

const sendWhatsAppMessage = async (to, otp) => {
  const apiKey = "S4YKGP5ZB9Q2J8LIDNM6OACTX";
  const url = "https://www.wpsenders.in/api/sendMessage";
  
  const message = `Your OTP for Gahoi Shakti login is: ${otp}. This OTP will expire in 10 minutes.`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      api_key: apiKey,
      message: message,
      number: to,
      route: 1, // 1 for Transactional
      country_code: 91
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`WhatsApp API Error: ${JSON.stringify(error)}`);
  }

  return await response.json();
};

module.exports = createCoreController('api::user-mpin.user-mpin', ({ strapi }) => ({
  async checkUserAndMPIN(ctx) {
    try {
      const { mobileNumber } = ctx.params;

      if (!isValidMobileNumber(mobileNumber)) {
        return ctx.badRequest('Invalid mobile number format');
      }

      const user = await strapi.db.query('api::user-mpin.user-mpin').findOne({
        where: { mobileNumber }
      });

      return {
        exists: !!user,
        hasMpin: user ? !!user.mpin : false
      };
    } catch (error) {
      return ctx.badRequest('Error checking user status');
    }
  },

  async verifyMPIN(ctx) {
    try {
      const { mobileNumber, mpin } = ctx.request.body;

      if (!isValidMobileNumber(mobileNumber) || !isValidMPIN(mpin)) {
        return ctx.badRequest('Invalid input format');
      }

      const user = await strapi.db.query('api::user-mpin.user-mpin').findOne({
        where: { mobileNumber }
      });

      if (!user || !user.mpin || user.mpin !== hashMPIN(mpin)) {
        return ctx.badRequest('Invalid MPIN');
      }

      // Generate JWT token
      const token = strapi.plugins['users-permissions'].services.jwt.issue({
        id: user.id,
        mobileNumber: user.mobileNumber
      });

      return {
        jwt: token,
        isRegistered: true
      };
    } catch (error) {
      return ctx.badRequest('Error verifying MPIN');
    }
  },

  async sendWhatsAppOTP(ctx) {
    try {
      const { mobileNumber } = ctx.request.body;

      if (!isValidMobileNumber(mobileNumber)) {
        return ctx.badRequest('Invalid mobile number format');
      }

      const otp = generateOTP();
      
      try {
        if (process.env.NODE_ENV === 'production') {
          await sendWhatsAppMessage(mobileNumber, otp);
        }
        
        await strapi.db.query('api::user-mpin.user-mpin').upsert({
          where: { mobileNumber },
          data: {
            mobileNumber,
            lastOtp: hashMPIN(otp),
            lastOtpSent: new Date()
          }
        });

        return {
          success: true,
          message: 'OTP sent successfully',
          otp: process.env.NODE_ENV === 'development' ? otp : undefined
        };
      } catch (error) {
        console.error('WhatsApp API Error:', error);
        return ctx.badRequest('Failed to send OTP via WhatsApp');
      }
    } catch (error) {
      return ctx.badRequest('Error sending OTP');
    }
  },

  async verifyOTP(ctx) {
    try {
      const { mobileNumber, otp } = ctx.request.body;

      if (!isValidMobileNumber(mobileNumber) || !otp || otp.length !== 4) {
        return ctx.badRequest('Invalid input format');
      }

      const user = await strapi.db.query('api::user-mpin.user-mpin').findOne({
        where: { mobileNumber }
      });

      if (!user) {
        return ctx.badRequest('User not found');
      }

      if (!user.lastOtp || !user.lastOtpSent) {
        return ctx.badRequest('No OTP was sent');
      }

      // Check if OTP is expired (10 minutes)
      const otpExpiry = new Date(user.lastOtpSent);
      otpExpiry.setMinutes(otpExpiry.getMinutes() + 10);
      
      if (new Date() > otpExpiry) {
        return ctx.badRequest('OTP has expired');
      }

      if (user.lastOtp !== hashMPIN(otp)) {
        return ctx.badRequest('Invalid OTP');
      }

      // Clear OTP data after successful verification
      await strapi.db.query('api::user-mpin.user-mpin').update({
        where: { id: user.id },
        data: {
          lastOtp: null
        }
      });

      // Generate JWT token
      const token = strapi.plugins['users-permissions'].services.jwt.issue({
        id: user.id,
        mobileNumber: user.mobileNumber
      });

      return {
        jwt: token,
        hasMpin: !!user.mpin,
        isRegistered: !!user.mpin // Consider user registered if they have set MPIN
      };
    } catch (error) {
      return ctx.badRequest('Error verifying OTP');
    }
  },

  async setMPIN(ctx) {
    try {
      const { mobileNumber, mpin } = ctx.request.body;

      if (!isValidMobileNumber(mobileNumber) || !isValidMPIN(mpin)) {
        return ctx.badRequest('Invalid input format');
      }

      const user = await strapi.db.query('api::user-mpin.user-mpin').findOne({
        where: { mobileNumber }
      });

      if (!user) {
        return ctx.badRequest('User not found');
      }

      await strapi.db.query('api::user-mpin.user-mpin').update({
        where: { id: user.id },
        data: {
          mpin: hashMPIN(mpin)
        }
      });

      // Generate JWT token
      const token = strapi.plugins['users-permissions'].services.jwt.issue({
        id: user.id,
        mobileNumber: user.mobileNumber
      });

      return {
        jwt: token,
        isRegistered: true
      };
    } catch (error) {
      return ctx.badRequest('Error setting MPIN');
    }
  }
})); 