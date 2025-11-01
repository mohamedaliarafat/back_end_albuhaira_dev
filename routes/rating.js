
const router = require('express').Router();
const ratingController = require('../controllers/ratingController');
const { verifyPhone, verifyClient } = require('../middleware/verifyToken');


router.post("/",verifyPhone, verifyClient ,ratingController.addRating);


router.get("/",verifyPhone, verifyClient , ratingController.checkUserRating);


module.exports = router;