#!/usr/bin/env bash
# Pruebas unitarias + pruebas de API con cobertura REAL del backend (src/).
# Requiere MongoDB accesible en MONGODB_URI y las variables de entorno del CI.
set -uo pipefail

rm -rf coverage

echo "== Pruebas unitarias =="
npx c8 --reporter=none node --test test/*.test.js || exit 1

echo "== Poblando base de datos =="
node src/seed/seed.js || exit 1

echo "== Levantando API con cobertura V8 =="
NODE_V8_COVERAGE="$PWD/coverage/tmp" node -r ./scripts/ci/graceful-exit.js src/server.js &
SERVER_PID=$!

for i in $(seq 1 30); do
  curl -sf "http://127.0.0.1:${PORT}/api/health" >/dev/null && break
  sleep 1
done
curl -sf "http://127.0.0.1:${PORT}/api/health" >/dev/null || { echo "La API no arrancó"; kill "$SERVER_PID" 2>/dev/null; exit 1; }

echo "== Pruebas de API (Jest) =="
npx jest src/tests/specs --runInBand --forceExit
JEST_EXIT=$?

echo "== Apagando API con SIGTERM para volcar cobertura =="
kill -TERM "$SERVER_PID" 2>/dev/null
wait "$SERVER_PID" 2>/dev/null

npx c8 report --reporter=lcov --reporter=text
exit $JEST_EXIT
