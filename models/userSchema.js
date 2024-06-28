const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const SECRECT_KEY = "abcdefghijklmnop"

const userSchema = new mongoose.Schema({
    fname: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("Not Valid Email")
            }
        }
    },
    dialCode:{
        type: String,
        required: true
        
    },
    phone: {
        type: String,
        required: true,
        minlength: 10
    },
    course: {
        type: String,
        enum:["Power Bi","Tableau","Basic SQL","Advanced SQL","Google Sheets","MS-Excel"],
        default:"MS-Excel",
        required: true,
       
    },
    HighestQualification: {
        type: String,
        enum:["IT Graduate","Pursuing Graduation","Non-IT Graduate"],
        default:"IT Graduate",
        required: true,
       
    },
    Yog: {
        type: String,
        enum:["After 2024","2024","2023","2022","2021","Before 2021"],
        default:"After 2024",
        required: true,
       
    },
   tokens:[
    {
        token:{
            type:String,
            required:true
        }
    }
   ]
});



// hash password

// token generate
userSchema.methods.generateAuthtoken = async function(){
    try {
        let newtoken = jwt.sign({_id:this._id},SECRECT_KEY,{
            expiresIn:"1d"
        });

        this.tokens = this.tokens.concat({token:newtoken});
        await this.save();
        return newtoken;
    } catch (error) {
        res.status(400).json(error)
    }
}


// creating model
const users = new mongoose.model("users", userSchema);

module.exports = users;