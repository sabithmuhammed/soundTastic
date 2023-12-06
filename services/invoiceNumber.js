const crypto = require("crypto");
const generateInvoiceNumber = (prefix = "INV") => {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
  const day = currentDate.getDate().toString().padStart(2, "0");
  const randomBytes = crypto.randomBytes(Math.ceil(3 / 2));
  const randomPart = parseInt(randomBytes.toString("hex"), 16)
    .toString()
    .padStart(3, "0");

  const invoiceNumber = `${prefix}-${year}${month}${day}-${randomPart}`;
  return invoiceNumber;
};

module.exports=generateInvoiceNumber
