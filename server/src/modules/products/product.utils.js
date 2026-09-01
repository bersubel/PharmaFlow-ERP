const Product = require("./product.model");

const generateProductCode = async () => {
  const count = await Product.countDocuments();

  const next = count + 1;

  return `MED-${String(next).padStart(5, "0")}`;
};

module.exports = {
  generateProductCode,
};