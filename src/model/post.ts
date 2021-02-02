import mongoose from 'mongoose';
const Schema = mongoose.Schema;


const postSchema = new Schema({
  userId: { type: String },
  title: { type: String, unique: true },
  category: { type: Number },
  preview: { type: String },
  titleImage: { type: String, default:'default image' },
  content: { type: String },
  like: { type: Number, default: 0 },
  publishedDate: { type: Date, default: Date.now }
});


export default mongoose.model('post', postSchema);