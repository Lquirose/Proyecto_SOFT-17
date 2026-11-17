// Precargado con `node -r` en el CI: permite apagar la API con SIGTERM
// para que c8 alcance a escribir los datos de cobertura (con kill -9 se pierden).
process.on('SIGTERM', () => process.exit(0));
