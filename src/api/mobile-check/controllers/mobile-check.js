module.exports = {
  async check(ctx) {
    const { mobile } = ctx.request.body;

    if (!mobile) {
      return ctx.badRequest('Mobile number is required');
    }

    const records = await strapi.db.query('api::registration-page.registration-page').findMany({
      where: {
        $or: [
          { personal_information: { mobile_number: mobile } },
          { family_details: { father_mobile: mobile } },
          { family_details: { mother_mobile: mobile } },
          { family_details: { spouse_mobile: mobile } },
          { family_details: { siblingDetails: { phone_number: mobile } } },
        ],
      },
      populate: {
        personal_information: true,
        family_details: true,
      },
    });

    if (records.length > 0) {
      const record = records[0];
      const role = getRole(record.family_details, mobile);

      return ctx.send({
        matchFound: true,
        mainProfileId: record.id,
        role,
        familyData: record,
      });
    }

    return ctx.send({
      matchFound: false,
    });
  },
};

function getRole(familyDetails, mobile) {
  if (familyDetails.father_mobile === mobile) return "father";
  if (familyDetails.mother_mobile === mobile) return "mother";
  if (familyDetails.spouse_mobile === mobile) return "spouse";
  const sibling = familyDetails?.siblingDetails?.find(s => s.phone_number === mobile);
  if (sibling) return `sibling (${sibling.sibling_relation})`;
  return "family member";
}
