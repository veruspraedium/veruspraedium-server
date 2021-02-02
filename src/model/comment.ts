import mongoose from 'mongoose';
const Schema = mongoose.Schema;


const commentSchema = new Schema({
  postId: { type: String },
  groupId: { type: String },
  content: { type: String },
  class: { type: Number },
  order: { type: Number },
  date: { type: Date, default: Date.now }
});


export default mongoose.model('comment', commentSchema);