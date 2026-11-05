# finances-front

App Expo (Expo Router + TypeScript) para la herramienta de seguimiento de gastos personales.
Corre en **web, iOS y Android** con el mismo código. Muestra el resumen del mes (balance,
gastos por categoría, últimos movimientos), la lista de movimientos con filtros y un formulario
para cargar, editar y borrar. Usa `GET/POST/PATCH/DELETE /movements` y `GET /categories`.

## 1. Levantar el backend

```bash
cd ../finances-back
eval "$(rbenv init - zsh)"
bin/rails db:prepare db:seed      # el seed imprime el token de desarrollo
bin/rails server -b 0.0.0.0       # 0.0.0.0 para que el emulador Android / celulares lleguen
```

## 2. Configurar

```bash
cp .env.example .env.local
```

- `EXPO_PUBLIC_API_URL` (opcional): por defecto `http://localhost:3000` en web/iOS y
  `http://10.0.2.2:3000` en el emulador Android. En un celular físico poné la IP de tu compu,
  ej. `http://192.168.0.10:3000`.
- `EXPO_PUBLIC_API_TOKEN`: token que se manda en `Authorization` hasta que exista login.

## 3. Correr

```bash
npm install
npm run web       # http://localhost:8081
npm run ios       # simulador iOS
npm run android   # emulador Android
npm run lint
npx tsc --noEmit
```

## Estructura

```
src/
  app/          pantallas (Expo Router): index (Inicio / Movimientos) y movement (alta / edición)
  api/          cliente fetch, tipos y endpoints (movements, categories)
  components/   UI base (ui.tsx), Kpi, HBar, MovementItem, Toast, StatusView
  hooks/        useFetch
  utils/        formato de montos, fechas y medios de pago
  config.ts     URL de la API y token
  theme.ts      tokens de color (claro / oscuro), fuentes y makeStyles
```
