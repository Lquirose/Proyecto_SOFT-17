const Order = require("../models/Order");
const Product = require("../models/Product");
const mongoose = require("mongoose");

// Auxiliar para construir consultas por id numérico u ObjectId de MongoDB
const identifierQuery = (value) => {
  if (/^\d+$/.test(String(value))) return { id: Number(value) };
  if (mongoose.isValidObjectId(value)) return { _id: value };
  return { _id: null };
};

// 1. Listar todas las órdenes (administrador o uso general)
exports.list = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate({ path: "usuario", select: "nombre correo", strictPopulate: false })
      .populate({ path: "items.producto", strictPopulate: false })
      .sort({ createdAt: -1 });

    res.json({ ok: true, data: orders });
  } catch (e) {
    next(e);
  }
};

// 2. Obtener órdenes por ID de usuario
exports.byUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const orders = await Order.find({ usuario: userId })
      .populate("items.producto")
      .sort({ createdAt: -1 });

    res.json({ ok: true, data: orders });
  } catch (e) {
    next(e);
  }
};

// 3. Obtener el detalle de una orden por su ID
exports.get = async (req, res, next) => {
  try {
    const order = await Order.findOne(identifierQuery(req.params.id))
      .populate("usuario", "nombre correo")
      .populate("items.producto");

    if (!order) {
      return res
        .status(404)
        .json({ ok: false, error: "Orden no encontrada" });
    }

    res.json({ ok: true, data: order });
  } catch (e) {
    next(e);
  }
};

// 4. Crear una nueva orden
exports.create = async (req, res, next) => {
  try {
    const { items, direccionEnvio, metodoPago } = req.body;

    // Validar que la lista de ítems exista y no esté vacía
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ ok: false, error: "La orden debe contener al menos un producto" });
    }

    const productPromises = items.map((item) =>
      Product.findOne(identifierQuery(item.productoId || item.producto))
    );

    // Ejecutamos todas las consultas de lectura de la BD concurrentemente
    const fetchedProducts = await Promise.all(productPromises);

    let total = 0;
    const processedItems = [];

    // Verificamos la existencia de productos, el stock y calculamos el total sin bloquear en I/O dentro del ciclo
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const product = fetchedProducts[i];

      if (!product) {
        return res.status(404).json({
          ok: false,
          error: `Producto con ID '${item.productoId || item.producto}' no encontrado`,
        });
      }

      if (product.stock < item.cantidad) {
        return res.status(400).json({
          ok: false,
          error: `Stock insuficiente para el producto '${product.nombre}'`,
        });
      }

      const subtotal = product.precio * item.cantidad;
      total += subtotal;

      processedItems.push({
        producto: product._id,
        precioUnitario: product.precio,
        cantidad: item.cantidad,
        subtotal,
      });
    }

    const stockUpdatePromises = processedItems.map((item) =>
      Product.findByIdAndUpdate(item.producto, {
        $inc: { stock: -item.cantidad },
      })
    );
    await Promise.all(stockUpdatePromises);

    // Generar ID correlativo numérico si la estructura del modelo lo requiere
    const lastOrder = await Order.findOne().sort({ id: -1 });
    const nextId = (lastOrder?.id || 0) + 1;

    // Crear y guardar la orden final
    const order = await Order.create({
      id: nextId,
      usuario: req.user?._id || req.user?.id,
      items: processedItems,
      total,
      direccionEnvio: direccionEnvio || "No especificada",
      metodoPago: metodoPago || "tarjeta",
      estado: "pendiente",
    });

    res.status(201).json({ ok: true, data: order });
  } catch (e) {
    next(e);
  }
};

// 5. Actualizar el estado de una orden (solo administrador)
exports.status = async (req, res, next) => {
  try {
    const { estado } = req.body;
    const estadosValidos = ["pendiente", "procesando", "completado", "cancelado"];

    if (!estado || !estadosValidos.includes(estado)) {
      return res.status(400).json({
        ok: false,
        error: `El estado proporcionado no es válido. Estados permitidos: ${estadosValidos.join(", ")}`,
      });
    }

    const order = await Order.findOneAndUpdate(
      identifierQuery(req.params.id),
      { estado },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res
        .status(404)
        .json({ ok: false, error: "Orden no encontrada" });
    }

    res.json({ ok: true, data: order });
  } catch (e) {
    next(e);
  }
};