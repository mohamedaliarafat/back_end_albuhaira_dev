const User = require('../models/User');
const Address = require('../models/Address');

module.exports = {
    // 🟢 إضافة عنوان جديد
    addAddress: async (req, res) => {
        try {
           const newAddress = new Address({
                userId: req.user.id,
                addressLine1: req.body.addressLine1,
                city: req.body.city,
                district: req.body.district,
                state: req.body.state,
                country: req.body.country,
                postalCode: req.body.postalCode,
                default: req.body.default,
                deliveryInstructions: req.body.deliveryInstructions,
                latitude: req.body.latitude,
                longitude: req.body.longitude,
            });

            // لو المستخدم اختار العنوان ده كـ default
            if (req.body.isDefault === true) {
                await Address.updateMany({ userId: req.user.id }, { isDefault: false });
            }

            await newAddress.save();
            res.status(201).json({ status: true, message: "Address successfully added" });
        } catch (error) {
            res.status(500).json({ status: false, message: error.message });
        }
    },

    // 🟡 جلب جميع العناوين
    getAddress: async (req, res) => {
        try {
            const address = await Address.find({ userId: req.user.id });
            res.status(200).json(address);
        } catch (error) {
            res.status(500).json({ status: false, message: error.message });
        }
    },

    // 🔴 حذف عنوان
    deleteAddress: async (req, res) => {
        try {
            await Address.findByIdAndDelete(req.params.id);
            res.status(200).json({ status: true, message: "Address successfully deleted" });
        } catch (error) {
            res.status(500).json({ status: false, message: error.message });
        }
    },

    // 🔵 تعيين العنوان كافتراضي
    setAddressDefault: async (req, res) => {
        const addressId = req.params.id;
        const userId = req.user.id;

        try {
            // ألغِ الـ default عن كل العناوين القديمة
            await Address.updateMany({ userId: userId }, { isDefault: false });

            // فعل الـ default على العنوان المطلوب
            const updatedAddress = await Address.findByIdAndUpdate(addressId, { isDefault: true });

            if (updatedAddress) {
                await User.findByIdAndUpdate(userId, { addressId: addressId });
                return res.status(200).json({ status: true, message: "Address set as default" });
            } else {
                return res.status(404).json({ status: false, message: "Address not found" });
            }
        } catch (error) {
            res.status(500).json({ status: false, message: error.message });
        }
    },

    // 🟣 جلب العنوان الافتراضي
    getDefaultAddress: async (req, res) => {
        const userId = req.user.id;

        try {
            const address = await Address.findOne({ userId: userId, isDefault: true });
            res.status(200).json(address);
        } catch (error) {
            res.status(500).json({ status: false, message: error.message });
        }
    }
};
