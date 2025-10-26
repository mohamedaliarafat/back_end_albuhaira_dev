const { TenantAwareAuth } = require('firebase-admin/auth');
const Order = require('..//models/Order');


module.exports = {
    placeOrder: async (req, res) => {
        const newOrder = new Order({
            ...req.body,
            userId: req.user.id
        });

        try{
            await newOrder.save();

            const orderId = newOrder._id;
            res.status(200).json({status: true, messgae: "Order placed successfully", orderId: orderId }
            )
        
        } catch (error){
            res.status(500).json({status: false, message: error.message});
        }
        
    },
    getUserOrder: async (req, res) =>{
        const userId = req.user.id;
        const {paymentStatus, orderStatus} = req.body;

        let query = {userId};

        if(paymentStatus){
            query.paymentStatus = paymentStatus;
        }

        if(orderStatus  === orderStatus){
            query.orderStatus = orderStatus;
        }
        try {
            const orders = await Order.find(query)
            .populate({
                path: "orderItems.foodId",
                select: "imageUrl title rating time",

            })

            res.status(200).json({orders})
        }catch (error){
            res.status(500).json({status: false, message: error.message});
        }
    },
    
}