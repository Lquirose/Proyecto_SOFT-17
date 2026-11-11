module.exports = {
  // Orden con datos válidos
  validOrder: (productId) => ({
    items: [
      {
        productoId: productId,
        cantidad: 2
      }
    ],
    direccionEnvio: "San José, Costa Rica",
    metodoPago: "tarjeta"
  }),

  // Caso negativo: Orden sin ítems
  emptyItemsOrder: {
    items: [],
    direccionEnvio: "San José, Costa Rica"
  },

  // IDs para pruebas negativas
  nonExistentOrderId: "60f71b9f9f1b2c0015f8e999"
};