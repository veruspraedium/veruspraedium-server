import mongoose from 'mongoose';
const Schema = mongoose.Schema;


const postSchema = new Schema({
  userId: String,
  title: { type: String, unique: true },
  category: Number,
  preview: String,
  titleImage: { type: String, default:'default image' },
  content: String,
  like: { type: Number, default: 0 },
  publishedDate: { type: Date, default: Date.now }
});


export default mongoose.model('post', postSchema);