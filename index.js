import express from "express";
import cors from "cors";
import RedirectRoute from "./routes/redirect.js"
import UrlRoute from "./routes/url.js"
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config()

const app = express();
app.use(cors())

const MONGO_URL = process.env.MONGO_URL;
const PORT =  process.env.PORT || 5000;

mongoose.connect(MONGO_URL,{useNewUrlParser: true, useUnifiedTopology: true})
.then(()=> app.listen(PORT, ()=> console.log(`Listening at ${PORT}`)))
.catch((error) => console.log(error));

app.use(express.json({
    extended: false
}))

app.use('/', RedirectRoute)
app.use('/api/url', UrlRoute)

