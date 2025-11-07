const mongoose = require('mongoose');

const completeProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  companyName: { type: String, default: "" },
  email: { type: String, default: "" },

  // المستندات التي الكونترولر يملأها
  documents: {
    licenseBusiness: { type: String, default: "" },
    licenseEnergy: { type: String, default: "" },
    commercialRecord: { type: String, default: "" },
    taxNumber: { type: String, default: "" },
    nationalAddress: { type: String, default: "" },
    civilDefense: { type: String, default: "" },
  },

  commercialLicense: { type: String, default: "" },
  energyLicense: { type: String, default: "" },
  commercialRecord: { type: String, default: "" },
  taxNumber: { type: String, default: "" },
  nationalAddress: { type: String, default: "" },
  civilDefenseLicense: { type: String, default: "" },
}, { timestamps: true });

module.exports = mongoose.models.CompleteProfile || mongoose.model('CompleteProfile', completeProfileSchema);
