const mongoose = require('mongoose');

const TodoSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Completed'],
        default: 'Pending'
    },
    createdDate: {
        type: Date,
        default: Date.now
    },
    updatedDate: {
        type: Date,
        default: Date.now
    },
    completedDate: {
        type: Date,
        default: null
    },
    project: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    deleted:{
        type:Boolean,
        default:false
    }
});

module.exports = mongoose.model('Todo', TodoSchema);
