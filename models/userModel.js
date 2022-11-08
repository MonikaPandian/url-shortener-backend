import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,   
  },
  firstName: {
    type: String,   
  },
  lastName: {
    type: String,    
  }, 
  status: {
    type: String,
  },
  date: {
    type: String,
    default: Date.now
  }
})

var UserModel = mongoose.model('Users', UserSchema)
export default UserModel;