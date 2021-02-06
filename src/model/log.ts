import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const logSchema = new Schema({
  code: { type: String },
  content: { type: String },
  date: { type: Date, default: Date.now }
},{ versionKey : false });

export default mongoose.model('log', logSchema);