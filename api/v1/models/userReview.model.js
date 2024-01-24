const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userReviewSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true },
  comment: { type: String }
});

const UserReview = mongoose.model('UserReview', userReviewSchema);

module.exports = UserReview;
