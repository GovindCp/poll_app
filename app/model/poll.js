const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//================================
// Poll Schema
//================================
const PollSchema = new Schema({
    subject: {
        type: String, 
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    isActive: {
        type: Boolean,
        default: true
    },
    options: {
        type: Schema.Types.Mixed,
        required: true
    },
    voters:{
        type: Schema.Types.Mixed
    }
},
{
    timestamps: true
});

var PollModel = mongoose.model('Poll', PollSchema);
module.exports = PollModel;
