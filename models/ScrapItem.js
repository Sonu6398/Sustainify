const mongoose = require('mongoose');
// mongoose.connect("mongodb://127.0.0.1:27017/ScrapItem");

const scrapItemSchema = new mongoose.Schema({
    category: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    unit: { type: String, required: true },
    imageUrl: { type: String, required: true }
});

const ScrapItem = mongoose.model('ScrapItem', scrapItemSchema);

module.exports = ScrapItem;