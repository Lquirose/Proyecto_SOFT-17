const ProductService = require('../services/productService');
const CategoryService = require('../services/categoryService');
const AuthService = require('../services/authService');
const productData = require('../data/productData');
const categoryData = require('../data/categoryData');
const authData = require('../data/authData');

describe('Pruebas Funcionales de API - Módulo de Productos', () => {
  let adminToken = '';
  let createdProductId = null;
  let categoryName = 'General';

  beforeAll(async () => {
    // 1. Registrar administrador
    const adminUser = {
      ...authData.validRegistration(),
      rol: 'admin'
    };
    const authRes = await AuthService.register(adminUser);
    if (authRes.data && authRes.data.token) {
      adminToken = authRes.data.token;
    }

    // 2. Crear categoría previa requerida por el esquema de Mongoose
    const newCategory = categoryData.validCategory();
    const catRes = await CategoryService.create(newCategory, adminToken);
    if (catRes.data && catRes.data.data) {
      categoryName = catRes.data.data.nombre;
    }
  });

  describe('GET /api/products', () => {

    test('7. [Positivo] Debe obtener la lista general de productos con respuesta exitosa (200)', async () => {
      const response = await ProductService.list();

      expect(response.status).toBe(200);
      expect(response.data.ok).toBe(true);
      expect(Array.isArray(response.data.data)).toBe(true);
    });

    test('8. [Positivo] Debe permitir filtrar la lista de productos por parámetro de búsqueda (search)', async () => {
      const response = await ProductService.list({ search: 'Test' });

      expect(response.status).toBe(200);
      expect(response.data.ok).toBe(true);
      expect(Array.isArray(response.data.data)).toBe(true);
    });

    test('9. [Positivo] Debe permitir filtrar productos por categoría', async () => {
      const response = await ProductService.list({ categoria: 'Electronica' });

      expect(response.status).toBe(200);
      expect(response.data.ok).toBe(true);
      expect(Array.isArray(response.data.data)).toBe(true);
    });

  });

  describe('GET /api/products/:id', () => {

    test('10. [Negativo] Debe retornar 404 Not Found cuando se busca un producto con ID inexistente', async () => {
      const response = await ProductService.getById(productData.nonExistentId);

      expect(response.status).toBe(404);
      expect(response.data.ok).toBe(false);
      expect(response.data.error).toBe('Producto no encontrado');
    });

    test('11. [Negativo] Debe retornar 404 Not Found cuando el ID tiene un formato inválido', async () => {
      const response = await ProductService.getById(productData.invalidObjectId);

      expect(response.status).toBe(404);
      expect(response.data.ok).toBe(false);
      expect(response.data.error).toBe('Producto no encontrado');
    });

  });

  describe('POST /api/products', () => {

    test('12. [Positivo] Debe crear un producto exitosamente cuando se envía un token válido', async () => {
      const newProduct = productData.validProduct(categoryName);
      const response = await ProductService.create(newProduct, adminToken);

      // Sintaxis corregida para Jest
      expect(response.status).toBe(201);
      expect(response.data.ok).toBe(true);
      expect(response.data.data).toHaveProperty('nombre');
      expect(response.data.data.nombre).toBe(newProduct.nombre);

      createdProductId = response.data.data.id || response.data.data._id;
    });

    test('13. [Negativo] Debe fallar al intentar crear un producto sin enviar token de autorización', async () => {
      const newProduct = productData.validProduct(categoryName);
      const response = await ProductService.create(newProduct, null);

      expect([401, 403]).toContain(response.status);
    });

    test('14. [Negativo] Debe retornar 400 Bad Request al enviar una categoría inexistente', async () => {
      const response = await ProductService.create(productData.productWithInvalidCategory, adminToken);

      expect(response.status).toBe(400);
      expect(response.data.ok).toBe(false);
      expect(response.data.error).toBe('Categoría no válida');
    });

  });

  describe('GET /api/products/:id (Verificación poscreación)', () => {

    test('15. [Positivo] Debe obtener la información del producto previamente creado', async () => {
      expect(createdProductId).not.toBeNull();

      const response = await ProductService.getById(createdProductId);

      expect(response.status).toBe(200);
      expect(response.data.ok).toBe(true);
    });

  });

});