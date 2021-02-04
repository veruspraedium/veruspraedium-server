import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const commentSchema = new Schema({
  postId: { type: String },
  groupId: { type: String },
  content: { type: String },
  userId: { type: String },
  class: { type: Number, default:1 },
  order: { type: Number, default:1 },
  date: { type: Date, default: Date.now }
},{ versionKey : false });

export default mongoose.model('comment', commentSchema);