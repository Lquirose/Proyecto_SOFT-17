module.exports = {
  // Casos positivos
  validRegistration: () => ({
    nombre: `Usuario Test ${Date.now()}`,
    correo: `test_${Date.now()}@test.com`,
    password: "Password123!"
  }),

  // Casos negativos - Registro
  missingFieldsRegistration: {
    correo: "incompleto@test.com"
    // Falta nombre y password
  },

  existingUserRegistration: {
    nombre: "Usuario Existente",
    correo: "registrado@test.com", // Asumiendo que este correo ya fue previamente registrado o creado
    password: "Password123!"
  },

  // Casos negativos - Login
  invalidCredentialsLogin: {
    correo: "usuario_no_existente@test.com",
    password: "WrongPassword123"
  },

  missingPasswordLogin: {
    correo: "usuario@test.com"
  }
};