const bcrypt = require("bcryptjs");
const User = require("../models/User");
const sign = require("../utils/jwt");

exports.register = async (req, res, next) => {
  try {
    const { nombre, password } = req.body;
    const correo = typeof req.body.correo === "string" ? req.body.correo : "";
    if (!nombre || !correo || !password)
      return res
        .status(400)
        .json({ ok: false, error: "nombre, correo y password son requeridos" });
    if (await User.findOne({ correo }))
      return res
        .status(409)
        .json({ ok: false, error: "El correo ya está registrado" });
    const user = await User.create({
      nombre,
      correo,
      password: await bcrypt.hash(password, 10),
      rol: "cliente",
    });
    res
      .status(201)
      .json({
        ok: true,
        user: {
          id: user._id,
          nombre: user.nombre,
          correo: user.correo,
          rol: user.rol,
        },
        token: sign(user),
      });
  } catch (e) {
    next(e);
  }
};

exports.login = async (req, res, next) => {
  try {
    const correo = typeof req.body.correo === "string" ? req.body.correo : "";
    const password = typeof req.body.password === "string" ? req.body.password : "";
    const user = await User.findOne({ correo });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res
        .status(401)
        .json({ ok: false, error: "Correo o contraseña incorrectos" });
    res.json({
      ok: true,
      user: {
        id: user._id,
        nombre: user.nombre,
        correo: user.correo,
        rol: user.rol,
      },
      token: sign(user),
    });
  } catch (e) {
    next(e);
  }
};
