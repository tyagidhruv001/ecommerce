const express = require('express');
const router = express.Router();
const axios = require('axios');
const jsSHA = require('jssha');
const {v4:uuid} = require('uuid')
const {isLoggedIn} = require('../middleware')


router.post('/payment_gateway/payumoney', isLoggedIn, async (req, res) => {
    req.body.txnid = uuid(); // txnid must be unique on every call
    req.body.email = req.user.email;
    req.body.firstname = req.user.username;

    const pay = req.body;

    const hashString = process.env.MERCHANT_KEY
                        + '|' + pay.txnid
                        + '|' + pay.amount
                        + '|' + pay.productinfo
                        + '|' + pay.firstname
                        + '|' + pay.email
                        + '|' + '||||||||||'
                        + process.env.MERCHANT_SALT;

    const sha = new jsSHA('SHA-512', "TEXT");
    sha.update(hashString);
    const hash = sha.getHash("HEX");

    pay.key = process.env.MERCHANT_KEY;
    pay.surl = 'http://localhost:5000/payment/success';
    pay.furl = 'http://localhost:5000/payment/fail';
    pay.hash = hash;

    try {
        // PayU expects form-encoded (not JSON) data
        const formData = new URLSearchParams(pay).toString();
        const response = await axios.post('https://sandboxsecure.payu.in/_payment', formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            },
            maxRedirects: 0,
            validateStatus: (status) => status < 400
        });

        if (response.status >= 300 && response.status < 400) {
            return res.redirect(response.headers.location);
        }
        res.send(response.data);
    } catch (error) {
        res.send({ status: false, message: error.message });
    }
});

// success route
router.post('/payment/success', (req, res) => {
    res.send(req.body);
})

router.post('/payment/fail', (req, res) => {
    res.send(req.body);
})



module.exports = router;