import mongoose from 'mongoose';
const Schema = mongoose.Schema;


const userSchema = new Schema({
  id: String,
  password: String,
  nickname: String,
  address: String,
  introduce: { type: String, default: "default introduce" },
  profileImage: { type: String, default: "no image" },
  isWriter: { type: Boolean, default: false },
  subscribe: { type: Array, default: [] },
  lastLogin: { type: Date, default: Date.now },
  cert: { type: Boolean, default: false },
  published_date: { type: Date, default: Date.now }
});


export default mongoose.model('user', userSchema);