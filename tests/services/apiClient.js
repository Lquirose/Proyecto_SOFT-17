const axios = require('axios');
const config = require('../config/environment');

const apiClient = axios.create({
  baseURL: config.baseURL,
  timeout: config.timeout,
  validateStatus: () => true // Permite capturar status 4xx y 5xx para pruebas negativas sin lanzar excepciones abruptas
});

module.exports = apiClient;