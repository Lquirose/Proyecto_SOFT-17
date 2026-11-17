module.exports = () => {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET no está definido");
  return process.env.JWT_SECRET;
};
