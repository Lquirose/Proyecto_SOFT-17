const apiClient = require('./apiClient');

class OrderService {
  // Listar órdenes (requiere token)
  static async list(token = null) {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    return await apiClient.get('/orders', { headers });
  }

  // Obtenes detalle por ID
  static async getById(id, token = null) {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    return await apiClient.get(`/orders/${id}`, { headers });
  }

  // Crear orden
  static async create(orderData, token = null) {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    return await apiClient.post('/orders', orderData, { headers });
  }

  // Actualizar estado de orden (requiere token de administrador)
  static async updateStatus(id, status, token = null) {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    return await apiClient.patch(`/orders/${id}/status`, { estado: status }, { headers });
  }
}

module.exports = OrderService;