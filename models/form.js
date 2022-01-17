const mongoose=require("mongoose");
  
const formSchema=new mongoose.Schema({
    username : String,
    email    : String
});
  
module.exports=mongoose.model("Form",formSchema);