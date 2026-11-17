module.exports = {
  // Datos válidos para creación
  validCategory: () => ({
    nombre: `Categoria Test ${Date.now()}`
  }),

  // Caso negativo: Falta el nombre
  emptyNameCategory: {
    nombre: "   "
  },

  // IDs para pruebas negativas
  nonExistentCategoryId: "60f71b9f9f1b2c0015f8e999"
};