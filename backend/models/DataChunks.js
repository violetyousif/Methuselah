// Violet Yousif, 07/18/2025, Admin route to model chunks data from KnowledgeBase

// models/DataChunks.js
import mongoose from "mongoose";

const DataChunksSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    type: { type: String, required: true },
    id: { type: String, required: true },
    text: { type: String, required: true },
    source: { type: String, required: true },
    topic: { type: String, required: true },
    hash: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    embedding: { type: Array, required: true },
}, {
    timestamps: true,
    collection: 'KnowledgeBase'
});

const getDataChunks = mongoose.model('DataChunks', DataChunksSchema, 'KnowledgeBase');
export default getDataChunks;



