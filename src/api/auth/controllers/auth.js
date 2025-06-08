'use strict';

const crypto = require('crypto');

const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString(); // Changed to 4 digits
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
  try {
    // First try WPSenders API
    const response = await fetch('https://www.wpsenders.in/api/sendMessage', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        api_key: process.env.WPSENDERS_API_KEY,
        number: to,
        message: `Your OTP for Gahoi Shakti login is: ${otp}. Valid for 10 minutes.`,
        route: 1,
        country_code: 91
      })
    });

    if (!response.ok) {
      throw new Error('WPSenders API failed');
    }

    return await response.json();
  } catch (wpError) {
    console.log('WPSenders failed, trying WhatsApp Business API');
    
    // Fallback to WhatsApp Business API
    const token = process.env.WHATSAPP_API_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_BUSINESS_PHONE_NUMBER;
    
    if (!token || !phoneNumberId) {
      throw new Error('WhatsApp API credentials not configured');
    }

    const url = `https://graph.facebook.com/v17.0/${phoneNumberId}/messages`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: `91${to}`,
        type: "template",
        template: {
          name: "otp_alert",
          language: {
            code: "en"
          },
          components: [
            {
              type: "body",
              parameters: [
                {
                  type: "text",
                  text: otp
                }
              ]
            }
          ]
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`WhatsApp API Error: ${JSON.stringify(error)}`);
    }

    return await response.json();
  }
};

module.exports = {
  async checkUserAndMPIN(ctx) {
    try {
      const { mobileNumber } = ctx.params;

      if (!isValidMobileNumber(mobileNumber)) {
        return ctx.badRequest('Invalid mobile number format');
      }

      const user = await strapi.query('plugin::users-permissions.user').findOne({
        where: { mobileNumber }
      });

      return {
        exists: !!user,
        hasMPIN: user ? !!user.mpin : false
      };
    } catch (error) {
      console.error('Check user error:', error);
      return ctx.badRequest('Error checking user status');
    }
  },

  async verifyMPIN(ctx) {
    try {
      const { mobileNumber, mpin } = ctx.request.body;

      if (!isValidMobileNumber(mobileNumber) || !isValidMPIN(mpin)) {
        return ctx.badRequest('Invalid input format');
      }

      const user = await strapi.query('plugin::users-permissions.user').findOne({
        where: { mobileNumber }
      });

      if (!user || !user.mpin || user.mpin !== hashMPIN(mpin)) {
        return ctx.badRequest('Invalid MPIN');
      }

      const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
        id: user.id
      });

      return {
        jwt,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          mobileNumber: user.mobileNumber
        }
      };
    } catch (error) {
      console.error('MPIN verification error:', error);
      return ctx.badRequest('Error verifying MPIN');
    }
  },

  async sendWhatsAppOTP(ctx) {
    try {
      const { mobileNumber } = ctx.request.body;

      if (!isValidMobileNumber(mobileNumber)) {
        return ctx.badRequest('Invalid mobile number format');
      }

      const user = await strapi.query('plugin::users-permissions.user').findOne({
        where: { mobileNumber }
      });

      const otp = generateOTP();
      
      try {
        if (process.env.NODE_ENV === 'production') {
          await sendWhatsAppMessage(mobileNumber, otp);
        }

        const userData = {
          lastOtp: hashMPIN(otp),
          lastOtpSent: new Date(),
          otpAttempts: 0
        };

        if (!user) {
          await strapi.query('plugin::users-permissions.user').create({
            data: {
              username: `user_${mobileNumber}`,
              email: `${mobileNumber}@placeholder.com`,
              mobileNumber,
              ...userData,
              role: 1, // Default authenticated role
              provider: 'local',
              confirmed: true
            }
          });
        } else {
          await strapi.query('plugin::users-permissions.user').update({
            where: { id: user.id },
            data: userData
          });
        }

        return {
          success: true,
          message: 'OTP sent successfully',
          otp: process.env.NODE_ENV === 'development' ? otp : undefined
        };
      } catch (error) {
        console.error('WhatsApp send error:', error);
        return ctx.badRequest('Failed to send OTP. Please try again.');
      }
    } catch (error) {
      console.error('Send OTP error:', error);
      return ctx.badRequest('Error sending OTP');
    }
  },

  async verifyOTP(ctx) {
    try {
      const { mobileNumber, otp } = ctx.request.body;

      if (!isValidMobileNumber(mobileNumber) || !otp || otp.length !== 4) {
        return ctx.badRequest('Invalid input format');
      }

      const user = await strapi.query('plugin::users-permissions.user').findOne({
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
        return ctx.badRequest('OTP has expired. Please request a new one.');
      }

      if (user.lastOtp !== hashMPIN(otp)) {
        return ctx.badRequest('Invalid OTP');
      }

      // Clear OTP data after successful verification
      await strapi.query('plugin::users-permissions.user').update({
        where: { id: user.id },
        data: {
          lastOtp: null,
          otpAttempts: 0
        }
      });

      const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
        id: user.id
      });

      return {
        jwt,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          mobileNumber: user.mobileNumber,
          hasMPIN: !!user.mpin
        }
      };
    } catch (error) {
      console.error('OTP verification error:', error);
      return ctx.badRequest('Error verifying OTP');
    }
  },

  async setMPIN(ctx) {
    try {
      const { mobileNumber, mpin } = ctx.request.body;

      if (!isValidMobileNumber(mobileNumber) || !isValidMPIN(mpin)) {
        return ctx.badRequest('Invalid input format');
      }

      const user = await strapi.query('plugin::users-permissions.user').findOne({
        where: { mobileNumber }
      });

      if (!user) {
        return ctx.badRequest('User not found');
      }

      await strapi.query('plugin::users-permissions.user').update({
        where: { id: user.id },
        data: {
          mpin: hashMPIN(mpin)
        }
      });

      const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
        id: user.id
      });

      return {
        jwt,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          mobileNumber: user.mobileNumber
        }
      };
    } catch (error) {
      console.error('Set MPIN error:', error);
      return ctx.badRequest('Error setting MPIN');
    }
  }
};




// // src/api/auth/controllers/auth.js
// 'use strict';

// const crypto = require('crypto');

// const generateOTP = () => {
//   return Math.floor(1000 + Math.random() * 9000).toString(); // Changed to 4 digits
// };

// const isValidMobileNumber = (mobileNumber) => {
//   return /^[0-9]{10}$/.test(mobileNumber);
// };

// const isValidMPIN = (mpin) => {
//   return /^[0-9]{4}$/.test(mpin);
// };

// const hashMPIN = (mpin) => {
//   return crypto.createHash('sha256').update(mpin).digest('hex');
// };

// const sendWhatsAppMessage = async (to, otp) => {
//   try {
//     // First try WPSenders API
//     const response = await fetch('https://www.wpsenders.in/api/sendMessage', {
//       method: 'POST',
//       headers: {
//         'Accept': 'application/json',
//         'Content-Type': 'application/x-www-form-urlencoded'
//       },
//       body: new URLSearchParams({
//         api_key: process.env.WPSENDERS_API_KEY,
//         number: to,
//         message: `Your OTP for Gahoi Shakti login is: ${otp}. Valid for 10 minutes.`,
//         route: 1,
//         country_code: 91
//       })
//     });

//     if (!response.ok) {
//       throw new Error('WPSenders API failed');
//     }

//     return await response.json();
//   } catch (wpError) {
//     console.log('WPSenders failed, trying WhatsApp Business API');
    
//     // Fallback to WhatsApp Business API
//     const token = process.env.WHATSAPP_API_TOKEN;
//     const phoneNumberId = process.env.WHATSAPP_BUSINESS_PHONE_NUMBER;
    
//     if (!token || !phoneNumberId) {
//       throw new Error('WhatsApp API credentials not configured');
//     }

//     const url = `https://graph.facebook.com/v17.0/${phoneNumberId}/messages`;
    
//     const response = await fetch(url, {
//       method: 'POST',
//       headers: {
//         'Authorization': `Bearer ${token}`,
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         messaging_product: "whatsapp",
//         to: `91${to}`,
//         type: "template",
//         template: {
//           name: "otp_alert",
//           language: {
//             code: "en"
//           },
//           components: [
//             {
//               type: "body",
//               parameters: [
//                 {
//                   type: "text",
//                   text: otp
//                 }
//               ]
//             }
//           ]
//         }
//       })
//     });

//     if (!response.ok) {
//       const error = await response.json();
//       throw new Error(`WhatsApp API Error: ${JSON.stringify(error)}`);
//     }

//     return await response.json();
//   }
// };

// module.exports = {
//   async checkUserAndMPIN(ctx) {
//     try {
//       const { mobileNumber } = ctx.params;

//       if (!isValidMobileNumber(mobileNumber)) {
//         return ctx.badRequest('Invalid mobile number format');
//       }

//       const user = await strapi.query('plugin::users-permissions.user').findOne({
//         where: { mobileNumber }
//       });

//       return {
//         exists: !!user,
//         hasMPIN: user ? !!user.mpin : false
//       };
//     } catch (error) {
//       console.error('Check user error:', error);
//       return ctx.badRequest('Error checking user status');
//     }
//   },

//   async verifyMPIN(ctx) {
//     try {
//       const { mobileNumber, mpin } = ctx.request.body;

//       if (!isValidMobileNumber(mobileNumber) || !isValidMPIN(mpin)) {
//         return ctx.badRequest('Invalid input format');
//       }

//       const user = await strapi.query('plugin::users-permissions.user').findOne({
//         where: { mobileNumber }
//       });

//       if (!user || !user.mpin || user.mpin !== hashMPIN(mpin)) {
//         return ctx.badRequest('Invalid MPIN');
//       }

//       const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
//         id: user.id
//       });

//       return {
//         jwt,
//         user: {
//           id: user.id,
//           username: user.username,
//           email: user.email,
//           mobileNumber: user.mobileNumber
//         }
//       };
//     } catch (error) {
//       console.error('MPIN verification error:', error);
//       return ctx.badRequest('Error verifying MPIN');
//     }
//   },

//   async sendWhatsAppOTP(ctx) {
//     try {
//       const { mobileNumber } = ctx.request.body;

//       if (!isValidMobileNumber(mobileNumber)) {
//         return ctx.badRequest('Invalid mobile number format');
//       }

//       const user = await strapi.query('plugin::users-permissions.user').findOne({
//         where: { mobileNumber }
//       });

//       if (user?.isBlocked && user.blockUntil && new Date(user.blockUntil) > new Date()) {
//         const remainingTime = Math.ceil((new Date(user.blockUntil) - new Date()) / 60000);
//         return ctx.badRequest(`Account is temporarily blocked. Try again in ${remainingTime} minutes.`);
//       }

//       const otp = generateOTP();
      
//       try {
//         if (process.env.NODE_ENV === 'production') {
//           await sendWhatsAppMessage(mobileNumber, otp);
//         }

//         const userData = {
//           lastOtp: hashMPIN(otp),
//           lastOtpSent: new Date(),
//           otpAttempts: 0,
//           isBlocked: false,
//           blockUntil: null
//         };

//         if (!user) {
//           await strapi.query('plugin::users-permissions.user').create({
//             data: {
//               username: `user_${mobileNumber}`,
//               email: `${mobileNumber}@placeholder.com`,
//               mobileNumber,
//               ...userData,
//               role: 1, // Default authenticated role
//               provider: 'local',
//               confirmed: true
//             }
//           });
//         } else {
//           await strapi.query('plugin::users-permissions.user').update({
//             where: { id: user.id },
//             data: userData
//           });
//         }

//         return {
//           success: true,
//           message: 'OTP sent successfully',
//           otp: process.env.NODE_ENV === 'development' ? otp : undefined
//         };
//       } catch (error) {
//         console.error('WhatsApp send error:', error);
//         return ctx.badRequest('Failed to send OTP. Please try again.');
//       }
//     } catch (error) {
//       console.error('Send OTP error:', error);
//       return ctx.badRequest('Error sending OTP');
//     }
//   },

//   async verifyOTP(ctx) {
//     try {
//       const { mobileNumber, otp } = ctx.request.body;

//       if (!isValidMobileNumber(mobileNumber) || !otp || otp.length !== 4) { // Changed to 4 digits
//         return ctx.badRequest('Invalid input format');
//       }

//       const user = await strapi.query('plugin::users-permissions.user').findOne({
//         where: { mobileNumber }
//       });

//       if (!user) {
//         return ctx.badRequest('User not found');
//       }

//       if (user.isBlocked && user.blockUntil && new Date(user.blockUntil) > new Date()) {
//         const remainingTime = Math.ceil((new Date(user.blockUntil) - new Date()) / 60000);
//         return ctx.badRequest(`Account is temporarily blocked. Try again in ${remainingTime} minutes.`);
//       }

//       if (!user.lastOtp || !user.lastOtpSent) {
//         return ctx.badRequest('No OTP was sent');
//       }

//       // Check if OTP is expired (10 minutes)
//       const otpExpiry = new Date(user.lastOtpSent);
//       otpExpiry.setMinutes(otpExpiry.getMinutes() + 10);
      
//       if (new Date() > otpExpiry) {
//         return ctx.badRequest('OTP has expired. Please request a new one.');
//       }

//       if (user.lastOtp !== hashMPIN(otp)) {
//         const attempts = (user.otpAttempts || 0) + 1;
//         const updateData = { otpAttempts: attempts };

//         if (attempts >= 5) {
//           const blockUntil = new Date();
//           blockUntil.setMinutes(blockUntil.getMinutes() + 30);
//           updateData.isBlocked = true;
//           updateData.blockUntil = blockUntil;
//         }

//         await strapi.query('plugin::users-permissions.user').update({
//           where: { id: user.id },
//           data: updateData
//         });

//         if (attempts >= 5) {
//           return ctx.badRequest('Too many failed attempts. Account blocked for 30 minutes.');
//         }

//         return ctx.badRequest(`Invalid OTP. ${5 - attempts} attempts remaining.`);
//       }

//       // Clear OTP data after successful verification
//       await strapi.query('plugin::users-permissions.user').update({
//         where: { id: user.id },
//         data: {
//           lastOtp: null,
//           otpAttempts: 0,
//           isBlocked: false,
//           blockUntil: null
//         }
//       });

//       const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
//         id: user.id
//       });

//       return {
//         jwt,
//         user: {
//           id: user.id,
//           username: user.username,
//           email: user.email,
//           mobileNumber: user.mobileNumber,
//           hasMPIN: !!user.mpin
//         }
//       };
//     } catch (error) {
//       console.error('OTP verification error:', error);
//       return ctx.badRequest('Error verifying OTP');
//     }
//   },

//   async setMPIN(ctx) {
//     try {
//       const { mobileNumber, mpin } = ctx.request.body;

//       if (!isValidMobileNumber(mobileNumber) || !isValidMPIN(mpin)) {
//         return ctx.badRequest('Invalid input format');
//       }

//       const user = await strapi.query('plugin::users-permissions.user').findOne({
//         where: { mobileNumber }
//       });

//       if (!user) {
//         return ctx.badRequest('User not found');
//       }

//       await strapi.query('plugin::users-permissions.user').update({
//         where: { id: user.id },
//         data: {
//           mpin: hashMPIN(mpin)
//         }
//       });

//       const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
//         id: user.id
//       });

//       return {
//         jwt,
//         user: {
//           id: user.id,
//           username: user.username,
//           email: user.email,
//           mobileNumber: user.mobileNumber
//         }
//       };
//     } catch (error) {
//       console.error('Set MPIN error:', error);
//       return ctx.badRequest('Error setting MPIN');
//     }
//   }
// };