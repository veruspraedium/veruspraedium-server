import mongoose from 'mongoose';
const Schema = mongoose.Schema;


const commentSchema = new Schema({
  postId: String,
  groupId: String,
  content: String,
  class: Number,
  order: Number,
  date: { type: Date, default: Date.now }
});


export default mongoose.model('comment', commentSchema);