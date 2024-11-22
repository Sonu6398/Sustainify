const mongoose=require('mongoose');
mongoose.connect("mongodb://127.0.0.1:27017/ScrapData");
//Schema
const userschema = new mongoose.Schema({
    Name : { type : String , required :true},
    Email : { type : String , required : true , unique : true},
    Password : { type : String , required : true},
    pickups:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"pickup"
        }
    ]
});

const Usercred = mongoose.model('User',userschema);
module.exports = Usercred;