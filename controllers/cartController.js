const mongoose = require('mongoose');
const Cart = require('../models/Cart');
const Food = require('../models/Food'); // تأكد أن اسم الملف مطابق للـ model

module.exports = {
  // ✅ إضافة منتج للسلة
   addProductToCart: async (req, res) => {
    const userId = req.user.id;
    const { productId, totalPrice, quantity, additives } = req.body;

    try {
      // ✅ تحقق من أن المنتج فعلاً موجود
      const product = await Food.findById(productId);
      if (!product) {
        return res.status(400).json({ status: false, message: "المنتج غير موجود في قاعدة البيانات" });
      }

      // ✅ تأكد أن productId وصل فعلاً
      if (!productId) {
        return res.status(400).json({ status: false, message: "معرّف المنتج productId مفقود" });
      }

      // ✅ بحث عن نفس المنتج في السلة
      const existingProduct = await Cart.findOne({ userId, productId });
      let count;

      if (existingProduct) {
        existingProduct.totalPrice += totalPrice;
        existingProduct.quantity += quantity;
        await existingProduct.save();
      } else {
        const newCartItem = new Cart({
          userId,
          productId,
          totalPrice,
          quantity,
          additives
        });
        await newCartItem.save();
      }

      count = await Cart.countDocuments({ userId });
      return res.status(200).json({ status: true, count });

    } catch (error) {
      res.status(500).json({ status: false, message: error.message });
    }
  },

  // 🗑️ حذف عنصر من السلة
  removeCartItem: async (req, res) => {
    const cartItemId = req.params.id;
    const userId = req.user.id;

    try {
      await Cart.findByIdAndDelete({ _id: cartItemId });
      const count = await Cart.countDocuments({ userId });

      res.status(200).json({ status: true, message: "Item removed from cart", count });
    } catch (error) {
      res.status(500).json({ status: false, message: error.message });
    }
  },

  // 🛒 جلب كل عناصر السلة
 getCart: async (req, res) => {
  const userId = req.user.id;

  try {
    const cart = await Cart.findOne({ userId })
      .populate({
        path: 'items.productId', // ⚡️ ضع هنا path صحيح
        select: 'imageUrl title restaurant rating ratingCount',
        populate: {
          path: 'restaurant',
          select: 'time coords'
        }
      });

    if (!cart) {
      return res.status(200).json({ items: [], totalPrice: 0, quantity: 0 });
    }

    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
}
,

  // 🔢 عدد عناصر السلة
  getCartCount: async (req, res) => {
    const userId = req.user.id;
    try {
      const count = await Cart.countDocuments({ userId });
      res.status(200).json({ status: true, count });
    } catch (error) {
      res.status(500).json({ status: false, message: error.message });
    }
  },

  // ➖ تقليل كمية منتج
  decrementProductQty: async (req, res) => {
    const userId = req.user.id;
    const id = req.params.id;

    try {
      const cartItem = await Cart.findById(id);

      if (!cartItem) {
        return res.status(404).json({ status: false, message: "Cart item not found" });
      }

      const productPrice = cartItem.totalPrice / cartItem.quantity;

      if (cartItem.quantity > 1) {
        cartItem.quantity -= 1;
        cartItem.totalPrice -= productPrice;
        await cartItem.save();

        res.status(200).json({ status: true, message: "Product quantity decremented" });
      } else {
        await Cart.findByIdAndDelete({ _id: id });
        res.status(200).json({ status: true, message: "Product removed from cart" });
      }
    } catch (error) {
      res.status(500).json({ status: false, message: error.message });
    }
  }
};
