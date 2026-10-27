const apiClient = require('./apiClient');

class AuthService {
  static async register(userData) {
    return await apiClient.post('/auth/register', userData);
  }

  static async login(credentials) {
    return await apiClient.post('/auth/login', credentials);
  }
}

module.exports = AuthService;