const express = require('express')
const bodyParser=require("body-parser");
require('dotenv').config()

require('./config/databaseConnection')

const app = express()
const port = parseInt(process.env.PORT, 10) || 5000

app.set('views', './views');
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));
  
app.get("/",function(req,res){
    res.render("form");
});
  
app.get('/result',(req,res)=>{
    res.render('result');
});
  
app.post("/",function(req,res){
    const username=req.body.username;
    const email=req.body.email;

    res.redirect('/result')
});

app.use(function (req, res, next) {
    res.status(404).send("Sorry can't find that!")
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})