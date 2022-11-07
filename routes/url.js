import express from "express";
import validUrl from "valid-url"
import shortid from "shortid";
import UrlModel from "../models/urlModel.js";

const router = express.Router()

const baseUrl = 'https://url-shortener-110.herokuapp.com'

router.get('/', async(req, res)=>{
    try {
        const result = await UrlModel.find({})
        res.send(result)
    }
    catch (error) {
        res.status(500).json(error)
    }
})

router.get('/today', async(req, res)=>{
  
    try {
        const result = await UrlModel.find({})
        res.send(result)
    }
    catch (error) {
        res.status(500).json(error)
    }
})

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
                res.send({message:"success", shortUrl : url.shortUrl})
            } else{
                const shortUrl = baseUrl + '/' + urlCode

                url = new UrlModel({
                    longUrl,
                    shortUrl,
                    urlCode,
                    date: new Date()
                })
                await url.save()
                res.send({message:"success", shortUrl : url.shortUrl})
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