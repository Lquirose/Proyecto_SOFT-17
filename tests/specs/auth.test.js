const AuthService = require('../services/authService');
const authData = require('../data/authData');

describe('Pruebas Funcionales de API - Módulo de Autenticación', () => {

  describe('POST /api/auth/register', () => {
    
    test('1. [Positivo] Debe registrar exitosamente a un usuario nuevo con datos válidos', async () => {
      const newUser = authData.validRegistration();
      const response = await AuthService.register(newUser);

      expect(response.status).toBe(201);
      expect(response.data.ok).toBe(true);
      expect(response.data.user).toHaveProperty('id');
      expect(response.data.user.correo).toBe(newUser.correo);
      expect(response.data).toHaveProperty('token');
    });

    test('2. [Negativo] Debe retornar 400 Bad Request cuando faltan campos requeridos', async () => {
      const response = await AuthService.register(authData.missingFieldsRegistration);

      expect(response.status).toBe(400);
      expect(response.data.ok).toBe(false);
      expect(response.data.error).toContain('nombre, correo y password son requeridos');
    });

    test('3. [Negativo] Debe retornar 409 Conflict al intentar registrar un correo duplicado', async () => {
      const user = authData.validRegistration();
      // Primer registro exitoso
      await AuthService.register(user);

      // Intento de registro duplicado
      const duplicateResponse = await AuthService.register(user);

      expect(duplicateResponse.status).toBe(409);
      expect(duplicateResponse.data.ok).toBe(false);
      expect(duplicateResponse.data.error).toBe('El correo ya está registrado');
    });
  });

  describe('POST /api/auth/login', () => {

    test('4. [Positivo] Debe iniciar sesión correctamente con credenciales válidas y retornar JWT', async () => {
      // Registrar un usuario para asegurar credenciales válidas
      const user = authData.validRegistration();
      await AuthService.register(user);

      const response = await AuthService.login({
        correo: user.correo,
        password: user.password
      });

      expect(response.status).toBe(200);
      expect(response.data.ok).toBe(true);
      expect(response.data.user.correo).toBe(user.correo);
      expect(response.data).toHaveProperty('token');
    });

    test('5. [Negativo] Debe retornar 401 Unauthorized cuando las credenciales son incorrectas', async () => {
      const response = await AuthService.login(authData.invalidCredentialsLogin);

      expect(response.status).toBe(401);
      expect(response.data.ok).toBe(false);
      expect(response.data.error).toBe('Correo o contraseña incorrectos');
    });

    test('6. [Negativo] Debe retornar 401 Unauthorized cuando no se envía la contraseña', async () => {
      const response = await AuthService.login(authData.missingPasswordLogin);

      expect(response.status).toBe(401);
      expect(response.data.ok).toBe(false);
      expect(response.data.error).toBe('Correo o contraseña incorrectos');
    });

  });
});