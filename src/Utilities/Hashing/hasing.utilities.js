import bcrypt from "bcrypt";

export const hash = async ({ plainText = "", saltRound = process.env.SALT_ROUND } = {}) => {
  const salt = parseInt(saltRound); // ✅ تأكد إنها رقم
  return await bcrypt.hash(plainText, salt); // ✅ خليها async بدل hashSync
};

export const compare = async ({ plainText = "", hash = "" } = {}) => {
  return await bcrypt.compare(plainText, hash);
};
