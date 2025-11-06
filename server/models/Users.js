import mongoose from "mongoose";
import bcrypt from "bcryptjs";


const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
}, 
{ timestamps: true });

userSchema.methods.isPasswordValid = function(password) {
  return bcrypt.compareSync(password, this.passwordHash);
};
export default mongoose.model("User", userSchema);