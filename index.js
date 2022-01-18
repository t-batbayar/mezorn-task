const express = require('express')
const bodyParser=require("body-parser")
const multer = require('multer')
const multerS3 = require('multer-s3')
const aws = require('aws-sdk')
require('dotenv').config()
const { nanoid } = require('nanoid')
const path = require('path')

const UserSchema = require('./models/user')

require('./config/databaseConnection')

const getTextDatas = require('./libs/getTextDatas')
const CustomError = require('./libs/customError')
const errorMessages = require('./libs/errorMessages')

const PE = process.env
const app = express()
const port = parseInt(PE.PORT, 10) || 13000

app.set('views', './views')
app.set('view engine','ejs')
app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())

const client = new aws.Rekognition({
    accessKeyId: PE.AWS_ACCESS_KEY,
    secretAccessKey: PE.AWS_SECRET_ACCESS_KEY,
    region: PE.AWS_TEXTRACT_REGION
});

const s3 = new aws.S3({
    accessKeyId: PE.AWS_ACCESS_KEY,
    secretAccessKey: PE.AWS_SECRET_ACCESS_KEY,
    Bucket: PE.AWS_BUCKET_NAME,
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
    res.render("form", {
        register: false,
        passport: false,
        selfie: false,
        message: '',
    })
})

const imageFields = [{name: 'passport', maxCount: 1}, {name: 'selfie', maxCount: 1}]

app.post("/", upload.fields(imageFields), async (req,res) => {
    const formError = {
        register: true,
        passport: true,
        selfie: true,
        message: '',
    }

    const { passport, selfie } = req.files
    const { register } = req.body

    try {
        const passportImgParams = {
            Image: {
                S3Object: {
                    Bucket: PE.AWS_BUCKET_NAME,
                    Name: passport[0].key
                }
            }
        }
        const detectTextResponse = await client.detectText(passportImgParams)
        const detectTextResult = await detectTextResponse.promise()

        const texts = []
        if (detectTextResult && detectTextResult.TextDetections?.length) {
            detectTextResult.TextDetections.forEach(text => {
                if (text.DetectedText) {
                    texts.push(text.DetectedText)
                }
            })
        }

        if (!texts.length) {
            throw new CustomError(errorMessages.passportInfoError)
        }

        const userData = getTextDatas(texts)

        const compareFacesParams = {
            SourceImage: {
                S3Object: {
                    Bucket: PE.AWS_BUCKET_NAME,
                    Name: passport[0].key
                } 
            },
            TargetImage: {
                S3Object: {
                    Bucket: PE.AWS_BUCKET_NAME,
                    Name: selfie[0].key
                }
            },
            SimilarityThreshold: PE.AWS_REKOGNITION_SIMILARITY_THRESHOLD
        }

        const compareFacesResponse = client.compareFaces(compareFacesParams)
        const compareFacesResult = await compareFacesResponse.promise()

        if (!compareFacesResult.FaceMatches?.length) {
            throw new CustomError(errorMessages.compareFaceError)
        }        

        const facematchResults = compareFacesResult.FaceMatches.map(match => match.Similarity)

        if (!facematchResults.length || facematchResults.length < 2) {
            throw new CustomError(errorMessages.selfieError)
        }

        if (userData.registrationNumberEn.toUpperCase() !== register.toUpperCase()) {
            throw new CustomError(errorMessages.registerationNumberError)
        }

        const newUser = new UserSchema()
        newUser.familyName = userData.familyName
        newUser.familyNameEng = userData.familyNameEng
        newUser.lastname = userData.lastname
        newUser.lastnameEng = userData.lastnameEng
        newUser.firstname = userData.firstname
        newUser.firstnameEng = userData.firstnameEng
        newUser.registrationNumberMn = userData.registrationNumberMn
        newUser.registrationNumberEn = userData.registrationNumberEn
    
        const savedUser = await newUser.save()

    } catch (error) {
        if (passport && passport.length) {
            await s3.deleteObject({ Bucket: PE.AWS_BUCKET_NAME, Key: passport[0].key }).promise()
        }

        if (selfie && selfie.length) {
            await s3.deleteObject({ Bucket: PE.AWS_BUCKET_NAME, Key: selfie[0].key }).promise()
        }

        const defaultErrorMessage = 'Sorry there was an error'
        if (error instanceof CustomError) {
            formError.message = error.message

            switch (error.message) {
                case errorMessages.passportInfoError:
                    formError.passport = false
                    break
                case errorMessages.compareFaceError:
                    formError.selfie = false
                    break
                case errorMessages.selfieError:
                    formError.selfie = false
                    break
                case errorMessages.registerationNumberError:
                    formError.register = false
                    break
                default:
                    formError.passport = false
                    formError.selfie = false
                    formError.register = false
                    formError.message = defaultErrorMessage
            }
        } else {
            formError.message = defaultErrorMessage
        }

        return res.render('form', formError)
    }

    return res.render('form', formError)
})

app.use(function (req, res, next) {
    res.status(404).send("Sorry can't find that!")
})

app.listen(port, () => {
    console.log(`Mezorn task app listening at http://localhost:${port}`)
})