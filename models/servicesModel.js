const mongoose = require('mongoose');

const servicesSchema = mongoose.Schema(
    {
        name: { type: String },
        type: { type: String },
        icon: { type: String },
        isActive: {
            type: Boolean,
            default: true,
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('services', servicesSchema);
