const apiClient = require('./apiClient');

class ProductService {
  // Lista pública de productos
  static async list(params = {}) {
    return await apiClient.get('/products', { params });
  }

  // Detalle de un producto por ID o _id
  static async getById(id) {
    return await apiClient.get(`/products/${id}`);
  }

  // Crear producto (requiere token de administrador)
  static async create(productData, token = null) {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    return await apiClient.post('/products', productData, { headers });
  }

  // Actualizar producto (requiere token de administrador)
  static async update(id, productData, token = null) {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    return await apiClient.put(`/products/${id}`, productData, { headers });
  }

  // Eliminar producto (requiere token de administrador)
  static async remove(id, token = null) {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    return await apiClient.delete(`/products/${id}`, { headers });
  }
}

module.exports = ProductService;