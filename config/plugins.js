// module.exports = () => ({
//     upload: {
//       config: {
//         provider: 'local',
//         providerOptions: {
//           sizeLimit: 10000000, // 10 MB limit
//         },
//       },
//     },
//   });
  

module.exports = () => ({
  upload: {
    config: {
      provider: 'local',
      providerOptions: {
        sizeLimit: 10000000,
      },
      actionOptions: {
        upload: {
          optimize: false, //  Turn off auto-optimization
        },
      },
    },
  },
});
