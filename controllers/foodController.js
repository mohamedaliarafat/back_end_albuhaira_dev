
const Food = require('../models/Food');

module.exports = {
   addFood: async (req, res) => {
        const { title, foodTags, category, time, code, restaurant, description, price, imageUrl } = req.body;

        // تحقق فقط من الحقول الأساسية
        if (!title || !imageUrl || !foodTags || !code || !price || !category || !time || !restaurant || !description) {
            return res.status(400).json({ status: false, message: "You have a missing field" });
        }
       
               try {
                   const newFood = new Food(req.body);
                   await newFood.save();

                   res.status(201).json({ status: true, message: "Food has been successfully added" });
       
               } catch (error) {
                   res.status(500).json({ status: false, message: error.message });
       
               }
           },

           getFoodById: async(req, res) => {
            const id = req.params.id;
            try {
                const food = await Food.findById(id);
                res.status(200).json(food);
            } catch (error) {
                res.status(500).json({ status: false, message: error.message });
            }
           },

           getRandomFood: async (req, res) => {
            const code = req.params.code;

            try {
                let foods;
                if(code) {
                    foods = await Food.aggregate(
                    [
                        { $match: { code: code, isAvailable: true } },
                        { $sample: { size: 5} },
                        { $project: { __v: 0} }
                    ]
                    )
                }

                if(foods.length ===0) {
                     foods = await Food.aggregate(
                    [
                        { $match: { isAvailable: true } },
                        { $sample: { size: 5} },
                        { $project: { __v: 0} }
                    ]
                    )
                }

                res.status(200).json(foods);
            }catch {
                res.status(500).json({ status: false, message: error })
            }


           },

           getAllFoodsByCode: async (req, res) => {
                 const code = req.params.id;
            try {
                const foodList = await Food.find({code: req.params.code});


                res.status(200).json(foodList);

            }catch (error) {
                res.status(500).json({status: false , message: error.message});
                
                
            }
           },


            //Restaurant Menu
            getFoodsByRestaurant: async(req, res) => {
            const id = req.params.id;
            try {
                const foods = await Food.find({restaurant: id});
                res.status(200).json(foods);
            } catch (error) {
                res.status(500).json({ status: false, message: error.message });
            }
           },


            getFoodByCategoryAndCode: async(req, res) => {
            const { category, code } = req.params;
            try {
                const foods = await Food.find.aggregate([
                    { $match: {category: category, code: code, isAvailable: true} },
                    { $project: {__v: 0} }
                ]);

                if(foods.length == 0){
                    return res.status(200).json([]);
                }

                res.status(200).json(foods);
            } catch (error) {
                res.status(500).json({ status: false, message: error.message });
            }
           },

            searchFood: async(req, res) => {
            const search = req.params.search;
            try {
                const results = await Food.aggregate([
                    {
                        $search: {
                            index: "foods",
                            text: {
                            query: search,
                            path: {
                                wildcard: "*"
                            }
                            }
                        }
                    }
                ]);
                res.status(200).json(results);
            } catch (error) {
                res.status(500).json({ status: false, message: error.message });
            }
           },


            getRandomFoodsByCategoryAndCode: async(req, res) => {
            const {category, code} = req.params;
            try {
                let foods;
                foods = await Food.aggregate([
                    {$match: {category: category, code: code, isAvailable: true}},
                    {$sample: {size: 5}}
                ])

                if(!foods || foods.length === 0){
                    foods = await foods.aggregate([
                        {$match: { code: code, isAvailable: true}},
                        {$sample: {size: 10}},
                    ])
                }else if(!foods || foods.length === 0){
                    foods = await Food.aggregate([
                        {$match: {isAvailable: true}},
                        {$sample: {size: 10}},
                    ])
                }
                res.status(200).json(foods);
            } catch (error) {
                res.status(500).json({ status: false, message: error.message });
            }
           },

};