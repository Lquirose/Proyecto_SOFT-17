const OrderService = require('../services/orderService');
const ProductService = require('../services/productService');
const AuthService = require('../services/authService');
const orderData = require('../data/orderData');
const productData = require('../data/productData');
const authData = require('../data/authData');

describe('Pruebas Funcionales de API - Módulo de Órdenes', () => {
  let userToken = '';
  let productId = null;
  let createdOrderId = null;

  beforeAll(async () => {
    // 1. Obtener token de usuario autenticado
    const user = authData.validRegistration();
    const authRes = await AuthService.register(user);
    if (authRes.data && authRes.data.token) {
      userToken = authRes.data.token;
    }

    // 2. Crear un producto base para poder ordenarlo
    const productRes = await ProductService.create(productData.validProduct(), userToken);
    if (productRes.data && productRes.data.data) {
      productId = productRes.data.data.id || productRes.data.data._id;
    }
  });

  describe('POST /api/orders', () => {

    test('23. [Positivo] Debe crear una orden exitosamente con usuario autenticado e ítems válidos', async () => {
      if (!productId) return;

      const newOrder = orderData.validOrder(productId);
      const response = await OrderService.create(newOrder, userToken);

      expect([201, 200]).toContain(response.status);
      expect(response.data.ok).toBe(true);
      expect(response.data.data).toHaveProperty('_id');

      createdOrderId = response.data.data._id;
    });

    test('24. [Negativo] Debe retornar 401 Unauthorized al intentar crear una orden sin token', async () => {
      const newOrder = orderData.validOrder(productId);
      const response = await OrderService.create(newOrder, null);

      expect([401, 403]).toContain(response.status);
    });

    test('25. [Negativo] Debe fallar al enviar una orden con lista de ítems vacía', async () => {
      const response = await OrderService.create(orderData.emptyItemsOrder, userToken);

      expect([400, 422]).toContain(response.status);
    });

  });

  describe('GET /api/orders', () => {

    test('26. [Positivo] Debe listar las órdenes asociadas al usuario autenticado', async () => {
      const response = await OrderService.list(userToken);

      expect(response.status).toBe(200);
      expect(response.data.ok).toBe(true);
      expect(Array.isArray(response.data.data)).toBe(true);
    });

    test('27. [Negativo] Debe retornar 401 Unauthorized al consultar lista de órdenes sin autenticación', async () => {
      const response = await OrderService.list(null);

      expect([401, 403]).toContain(response.status);
    });

  });

  describe('GET /api/orders/:id', () => {

    test('28. [Positivo] Debe obtener la información detallada de la orden creada previamente', async () => {
      if (!createdOrderId) return;

      const response = await OrderService.getById(createdOrderId, userToken);

      expect(response.status).toBe(200);
      expect(response.data.ok).toBe(true);
      expect(response.data.data._id).toBe(createdOrderId);
    });

    test('29. [Negativo] Debe retornar 404 Not Found cuando la orden consultada no existe', async () => {
      const response = await OrderService.getById(orderData.nonExistentOrderId, userToken);

      expect(response.status).toBe(404);
      expect(response.data.ok).toBe(false);
    });

  });

  describe('PATCH /api/orders/:id/status', () => {

    test('30. [Negativo] Debe denegar la actualización de estado a usuarios no administradores (403/401)', async () => {
      if (!createdOrderId) return;

      const response = await OrderService.updateStatus(createdOrderId, 'completado', userToken);

      expect([401, 403]).toContain(response.status);
    });

  });

});