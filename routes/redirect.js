import express from "express";
import UrlModel from "../models/urlModel.js";

const router = express.Router();

router.get('/:code', async(req, res) => {
    try {
        const url = await UrlModel.findOne({ urlCode: req.params.code})
        if(url) {
            return res.redirect(url.longUrl)
        } else {
            return res.status(404).json('No URL found')
        }
    }

    catch(err) {
        console.error(err)
        res.status(500).json('Server Error')
    }   
})

export default router;