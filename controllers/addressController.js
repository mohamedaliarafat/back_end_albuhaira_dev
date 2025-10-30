const User = require('../models/User');
const Address = require('../models/Address');

module.exports = {
    // 🟢 إضافة عنوان جديد
            addAddress: async (req, res) => {
            try {
                const userId = req.user.id;

                // لو المستخدم اختار العنوان كـ default
                if (req.body.isDefault === true) {
                await Address.updateMany({ userId }, { isDefault: false });
                }

                const newAddress = new Address({
                userId,
                addressLine1: req.body.addressLine1,
                city: req.body.city,
                district: req.body.district,
                state: req.body.state,
                country: req.body.country,
                postalCode: req.body.postalCode,
                isDefault: req.body.isDefault || false,
                deliveryInstructions: req.body.deliveryInstructions,
                latitude: req.body.latitude,
                longitude: req.body.longitude,
                });

                await newAddress.save();

                // 📌 إضافة العنوان في قائمة المستخدم
                await User.findByIdAndUpdate(userId, { $push: { addresses: newAddress._id } });

                // 📌 لو العنوان ده افتراضي، نخزنه في defaultAddress كمان
                if (newAddress.isDefault) {
                await User.findByIdAndUpdate(userId, { defaultAddress: newAddress._id });
                }

                res.status(201).json({ status: true, message: "Address successfully added", address: newAddress });

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
            await Address.updateMany({ userId }, { isDefault: false });

            // فعل الـ default على العنوان المطلوب
            const updatedAddress = await Address.findByIdAndUpdate(addressId, { isDefault: true });

            if (!updatedAddress) {
            return res.status(404).json({ status: false, message: "Address not found" });
            }

            // 🟢 تحديث المستخدم بحيث العنوان ده هو الافتراضي
            await User.findByIdAndUpdate(userId, { defaultAddress: addressId });

            res.status(200).json({ status: true, message: "Address set as default" });

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
