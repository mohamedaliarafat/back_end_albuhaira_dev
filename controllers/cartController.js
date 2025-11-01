// const Cart = require('../models/Cart');
// const Food = require('../models/Food');

// module.exports = {
//   addProductToCart: async (req, res) => {
//     const userId = req.user.id;
//     const { productId, quantity, totalPrice, additives } = req.body;

//     try {
//       if (!productId) return res.status(400).json({ status: false, message: "معرّف المنتج مفقود" });

//       const product = await Food.findById(productId);
//       if (!product) return res.status(400).json({ status: false, message: "المنتج غير موجود" });

//       let cart = await Cart.findOne({ userId });
//       if (!cart) cart = new Cart({ userId, items: [] });

//       const existingItem = cart.items.find(i => i.productId.toString() === productId);
//       if (existingItem) {
//         existingItem.quantity += quantity;
//         existingItem.totalPrice += totalPrice;
//       } else {
//         cart.items.push({ productId, quantity, totalPrice, additives, title: product.title, imageUrl: product.imageUrl, restaurant: product.restaurant });
//       }

//       await cart.save();
//       res.status(200).json({ status: true, count: cart.items.length });
//     } catch (err) {
//       res.status(500).json({ status: false, message: err.message });
//     }
//   },

//   removeCartItem: async (req, res) => {
//     const userId = req.user.id;
//     const cartItemId = req.params.id;

//     try {
//       const cart = await Cart.findOne({ userId });
//       if (!cart) return res.status(404).json({ status: false, message: "السلة غير موجودة" });

//       cart.items = cart.items.filter(i => i._id.toString() !== cartItemId);
//       await cart.save();

//       res.status(200).json({ status: true, message: "تم حذف العنصر", count: cart.items.length });
//     } catch (err) {
//       res.status(500).json({ status: false, message: err.message });
//     }
//   },

//   getCart: async (req, res) => {
//     const userId = req.user.id;
//     try {
//       const cart = await Cart.findOne({ userId }).populate({
//         path: 'items.productId',
//         select: 'title imageUrl restaurant rating ratingCount',
//         populate: { path: 'restaurant', select: 'time coords' }
//       });

//       if (!cart) return res.status(200).json({ items: [], totalPrice: 0, quantity: 0 });

//       res.status(200).json(cart);
//     } catch (err) {
//       res.status(500).json({ status: false, message: err.message });
//     }
//   },

//   getCartCount: async (req, res) => {
//     const userId = req.user.id;
//     try {
//       const cart = await Cart.findOne({ userId });
//       const count = cart ? cart.items.length : 0;
//       res.status(200).json({ status: true, count });
//     } catch (err) {
//       res.status(500).json({ status: false, message: err.message });
//     }
//   },

//   decrementProductQty: async (req, res) => {
//     const userId = req.user.id;
//     const cartItemId = req.params.id;

//     try {
//       const cart = await Cart.findOne({ userId });
//       if (!cart) return res.status(404).json({ status: false, message: "السلة غير موجودة" });

//       const item = cart.items.find(i => i._id.toString() === cartItemId);
//       if (!item) return res.status(404).json({ status: false, message: "العنصر غير موجود" });

//       const pricePerUnit = item.totalPrice / item.quantity;
//       if (item.quantity > 1) {
//         item.quantity -= 1;
//         item.totalPrice -= pricePerUnit;
//       } else {
//         cart.items = cart.items.filter(i => i._id.toString() !== cartItemId);
//       }

//       await cart.save();
//       res.status(200).json({ status: true, message: "تم تعديل الكمية", count: cart.items.length });
//     } catch (err) {
//       res.status(500).json({ status: false, message: err.message });
//     }
//   }
// };
const Cart = require('../models/Cart');
const Food = require('../models/Food');

module.exports = {
  // 🟢 إضافة منتج للسلة
  addProductToCart: async (req, res) => {
    const userId = req.user.id;
    const { productId, quantity = 1, totalPrice, additives = [] } = req.body;

    try {
      if (!productId) return res.status(400).json({ status: false, message: "معرّف المنتج مفقود" });

      const product = await Food.findById(productId).populate("restaurant", "name time coords");
      if (!product) return res.status(404).json({ status: false, message: "المنتج غير موجود" });

      let cart = await Cart.findOne({ userId });
      if (!cart) cart = new Cart({ userId, items: [] });

      const existingItem = cart.items.find(i => i.productId.toString() === productId);
      const price = product.price || 0;

      if (existingItem) {
        existingItem.quantity += quantity;
        existingItem.totalPrice = existingItem.quantity * price;
      } else {
        cart.items.push({
          productId,
          title: product.title,
          imageUrl: product.imageUrl,
          restaurant: product.restaurant,
          additives,
          price,
          quantity,
          totalPrice: price * quantity,
        });
      }

      await cart.save();
      res.status(200).json({ status: true, message: "تم تحديث السلة", cart });
    } catch (err) {
      res.status(500).json({ status: false, message: err.message });
    }
  },

  // 🔵 حذف عنصر من السلة
  removeCartItem: async (req, res) => {
    const userId = req.user.id;
    const cartItemId = req.params.id;

    try {
      const cart = await Cart.findOne({ userId });
      if (!cart) return res.status(404).json({ status: false, message: "السلة غير موجودة" });

      cart.items = cart.items.filter(i => i._id.toString() !== cartItemId);
      await cart.save();

      res.status(200).json({ status: true, message: "تم حذف العنصر", cart });
    } catch (err) {
      res.status(500).json({ status: false, message: err.message });
    }
  },

  // 🟣 تقليل كمية منتج واحد
  decrementProductQty: async (req, res) => {
    const userId = req.user.id;
    const cartItemId = req.params.id;

    try {
      const cart = await Cart.findOne({ userId });
      if (!cart) return res.status(404).json({ status: false, message: "السلة غير موجودة" });

      const item = cart.items.find(i => i._id.toString() === cartItemId);
      if (!item) return res.status(404).json({ status: false, message: "العنصر غير موجود" });

      const pricePerUnit = item.totalPrice / item.quantity;

      if (item.quantity > 1) {
        item.quantity -= 1;
        item.totalPrice -= pricePerUnit;
      } else {
        cart.items = cart.items.filter(i => i._id.toString() !== cartItemId);
      }

      await cart.save();
      res.status(200).json({ status: true, message: "تم تعديل الكمية", cart });
    } catch (err) {
      res.status(500).json({ status: false, message: err.message });
    }
  },

  // 🟤 عرض السلة الحالية
  getCart: async (req, res) => {
    const userId = req.user.id;
    try {
      const cart = await Cart.findOne({ userId })
        .populate({
          path: 'items.productId',
          select: 'title imageUrl restaurant price',
          populate: { path: 'restaurant', select: 'name time coords' }
        });

      if (!cart) return res.status(200).json({ items: [], totalPrice: 0, quantity: 0 });

      res.status(200).json({ status: true, cart });
    } catch (err) {
      res.status(500).json({ status: false, message: err.message });
    }
  },

  // ⚫ عدد المنتجات في السلة
  getCartCount: async (req, res) => {
    const userId = req.user.id;
    try {
      const cart = await Cart.findOne({ userId });
      const count = cart ? cart.items.length : 0;
      res.status(200).json({ status: true, count });
    } catch (err) {
      res.status(500).json({ status: false, message: err.message });
    }
  },
};
