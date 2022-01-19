const mongoose=require("mongoose");
  
const UserSchema = new mongoose.Schema({
    familyName: String,
    familyNameEng: String,
    lastname: String,
    lastnameEng: String,
    firstname: String,
    firstnameEng: String,
    registrationNumberMn: String,
    registrationNumberEn: String,
    passportUrl: String,
    selfieUrl: String,
});
  
module.exports = mongoose.model("User", UserSchema);