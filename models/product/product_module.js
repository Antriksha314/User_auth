const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
  productName: { type: String },
  productPrice: { type: String },
  productDesc: { type: String },

});

module.exports = mongoose.model('Product', productSchema);
