const mongoose = require("mongoose")
const express = require("express")
const router = require("./routes/route")
const bodyParser = require("body-parser")
require('dotenv').config()

const app = express()
const mongoURL = process.env.DATABASE
const PORT = process.env.SERVER_PORT



app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended : false}))

async function main(){
    mongoose.connect(mongoURL)
}
main().catch(  error => console.log('error',error))

router(app)

app.listen(PORT, console.log(`App is running on localhost:${PORT}`))