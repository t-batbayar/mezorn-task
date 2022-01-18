const express = require('express')
const bodyParser=require("body-parser");
const multer = require('multer')
const multerS3 = require('multer-s3')
const aws = require('aws-sdk')
require('dotenv').config()
const { nanoid } = require('nanoid');
const path = require('path');

require('./config/databaseConnection')

const PE = process.env;
const app = express()
const port = parseInt(PE.PORT, 10) || 5000

app.set('views', './views');
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));


const s3 = new aws.S3({
    accessKeyId: PE.AWS_ACCESS_KEY,
    secretAccessKey: PE.AWS_SECRET_ACCESS_KEY,
    Bucket: PE.AWS_BUCKET_NAME,
})

const textract = new aws.Textract({
    accessKeyId: PE.AWS_ACCESS_KEY,
    secretAccessKey: PE.AWS_SECRET_ACCESS_KEY,
    region: PE.AWS_TEXTRACT_REGION
})

const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: PE.AWS_BUCKET_NAME,
        metadata: (_req, file, cb) => {
            cb(null, { fieldName: file.fieldname })
        },
        key: (_req, file, cb) => {
            const fileExtension = path.extname(file.originalname)
            cb(null, `${nanoid()}${fileExtension}`)
        } 
    })
})

app.get("/",function(req,res){
    res.render("form");
});
  
app.get('/result',(req,res)=>{
    // const status = req.query('status');
    res.render('result');
});

const imageFields = [{name: 'passport', maxCount: 1}, {name: 'selfie', maxCount: 1}]

app.post("/", upload.fields(imageFields), async (req,res) => {
    let status = 'success';

    try {
        const { passport, selfie } = req.files
        const { register } = req.body

        const detectParamsPassport = {
            Document: {
                S3Object: {
                    Bucket: PE.AWS_BUCKET_NAME,
                    Name: passport[0].key
                }
            },
            FeatureTypes: ['FORMS']
        }
        const request = await textract.analyzeDocument(detectParamsPassport)
        const data = await request.promise()

        const texts = [];
        if (data && data.Blocks) {
            data.Blocks.forEach(block => {
                if (block.hasOwnProperty('Text')) {
                    texts.push(data.Blocks.Text)
                }
            })
            console.log(data.Blocks)
        }
    } catch (error) {
        console.log(error)
        status = 'failed'
    }

    res.redirect(`/result?status=${status}`)
});

app.use(function (req, res, next) {
    res.status(404).send("Sorry can't find that!")
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})