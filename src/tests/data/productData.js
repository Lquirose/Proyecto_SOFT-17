module.exports = {
  validProduct: (categoryName = 'General') => ({
    nombre: `Producto Test ${Date.now()}`,
    precio: 2500,
    descripcion: "Descripción de prueba para automatización",
    stock: 10,
    categoria: categoryName
  }),

  productWithInvalidCategory: {
    nombre: "Producto Categoría Inválida",
    precio: 1500,
    descripcion: "Descripción de prueba",
    stock: 5,
    categoria: "CategoriaInexistente_123456"
  },

  nonExistentId: "999999999",
  invalidObjectId: "id_invalido_formato"
};