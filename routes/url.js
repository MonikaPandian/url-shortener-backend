import express from "express";
import validUrl from "valid-url"
import shortid from "shortid";
import UrlModel from "../models/urlModel.js";

const router = express.Router()

const baseUrl = 'http://localhost:9005'

router.post('/shorten', async(req, res)=>{
    const {longUrl} = req.body;

    if(!validUrl.isUri(baseUrl)){
        return res.status(401).json('Invalid base URL')
    }

    const urlCode = shortid.generate()

    if(validUrl.isUri(longUrl)){
        try{

            let url = await UrlModel.findOne({longUrl})

            if(url) {
                res.json(url)
            } else{
                const shortUrl = baseUrl + '/' + urlCode

                url = new UrlModel({
                    longUrl,
                    shortUrl,
                    urlCode,
                    date: new Date()
                })
                await url.save()
                res.json(url)
            }
        }
        catch(err){
            console.log(err)
            res.status(500).json('Server Error')
        }
    }else{
        res.status(401).json('Invalid longUrl')
    }
})

export default router;