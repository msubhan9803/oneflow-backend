const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const { Schema } = mongoose;

const adminSettingsSchema = new Schema({
  serviceFee: Number,
  tax: Number,
  rushFee: Number,
  organizationsList: [
    {
      nameOfOrganization: String,
      organizationAddress: String,
      organizationPhone: String,
      organizationEmail: String,
    },
  ],
  techniciansList: [
    {
      technicianName: String,
      technicianPhone: String,
    },
  ],
});

// add plugin that converts mongoose to json
adminSettingsSchema.plugin(toJSON);
adminSettingsSchema.plugin(paginate);

const AdminSettings = mongoose.model('AdminSettings', adminSettingsSchema);

module.exports = AdminSettings;
