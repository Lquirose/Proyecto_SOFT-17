const apiClient = require('./apiClient');

class CategoryService {
  // Listar categorías (público)
  static async list() {
    return await apiClient.get('/categories');
  }

  // Crear categoría (requiere token de administrador)
  static async create(categoryData, token = null) {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    return await apiClient.post('/categories', categoryData, { headers });
  }

  // Actualizar categoría (requiere token de administrador)
  static async update(id, categoryData, token = null) {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    return await apiClient.put(`/categories/${id}`, categoryData, { headers });
  }

  // Eliminar categoría (requiere token de administrador)
  static async remove(id, token = null) {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    return await apiClient.delete(`/categories/${id}`, { headers });
  }
}

module.exports = CategoryService;