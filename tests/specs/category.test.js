const CategoryService = require('../services/categoryService');
const AuthService = require('../services/authService');
const categoryData = require('../data/categoryData');
const authData = require('../data/authData');

describe('Pruebas Funcionales de API - Módulo de Categorías', () => {
  let adminToken = '';
  let createdCategoryId = null;

  beforeAll(async () => {
      const adminUser = {
        ...authData.validRegistration(),
        rol: 'admin'
      };
      const authRes = await AuthService.register(adminUser);
      if (authRes.data && authRes.data.token) {
        adminToken = authRes.data.token;
      }
    });

  describe('GET /api/categories', () => {

    test('16. [Positivo] Debe obtener la lista general de categorías con status 200', async () => {
      const response = await CategoryService.list();

      expect(response.status).toBe(200);
      expect(response.data.ok).toBe(true);
      expect(Array.isArray(response.data.data)).toBe(true);
    });

  });

  describe('POST /api/categories', () => {

    test('17. [Positivo] Debe crear una nueva categoría con token válido y autogenerar el slug', async () => {
      const newCategory = categoryData.validCategory();
      const response = await CategoryService.create(newCategory, adminToken);

      expect(response.status).toBe(201);
      expect(response.data.ok).toBe(true);
      expect(response.data.data).toHaveProperty('_id');
      expect(response.data.data.nombre).toBe(newCategory.nombre);
      expect(response.data.data).toHaveProperty('slug');

      createdCategoryId = response.data.data._id;
    });

    test('18. [Negativo] Debe retornar error cuando el nombre viene vacío', async () => {
      const response = await CategoryService.create(categoryData.emptyNameCategory, adminToken);
      expect([400, 403]).toContain(response.status);
    });

    test('19. [Negativo] Debe retornar 401/403 al intentar crear una categoría sin token', async () => {
      const newCategory = categoryData.validCategory();
      const response = await CategoryService.create(newCategory, null);

      expect([401, 403]).toContain(response.status);
    });

  });

  describe('PUT /api/categories/:id', () => {

    test('20. [Positivo] Debe actualizar el nombre de una categoría existente', async () => {
      if (!createdCategoryId) return;

      const updatedData = { nombre: `Categoria Editada ${Date.now()}` };
      const response = await CategoryService.update(createdCategoryId, updatedData, adminToken);

      expect(response.status).toBe(200);
      expect(response.data.ok).toBe(true);
      expect(response.data.data.nombre).toBe(updatedData.nombre);
    });

    test('21. [Negativo] Debe retornar error al intentar actualizar un ID inexistente', async () => {
      const response = await CategoryService.update(
        categoryData.nonExistentCategoryId,
        { nombre: 'Nombre Nuevo' },
        adminToken
      );
      expect([404, 403]).toContain(response.status);
    });

  });

  describe('DELETE /api/categories/:id', () => {

    test('22. [Positivo] Debe eliminar exitosamente una categoría sin productos asociados (204 No Content)', async () => {
      if (!createdCategoryId) return;

      const response = await CategoryService.remove(createdCategoryId, adminToken);

      expect(response.status).toBe(204);
    });

  });

});