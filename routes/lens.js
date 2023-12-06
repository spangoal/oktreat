const express = require('express');
const router = express.Router();
const axios = require('axios');
const AppError = require('../utils/appError');

const fetchLensData = async (req, res, next) => {
    try {
        const { data } = await axios.get(`https://serpapi.com/search`, {
            params: req.query,
        });

        return res.status(200).json(data);
    } catch (error) {
        console.log('lens error', error);
        return next(new AppError('Something went wrong', 500));
    }
};

router.route('/').get(fetchLensData);

module.exports = router;
