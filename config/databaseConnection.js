const mongoose=require("mongoose");

const uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}?authSource=admin`

mongoose.connect(uri)
.then(() => console.log('connected'))
.catch(error => {
    console.log('db connection error:', error)
})
