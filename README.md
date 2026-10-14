# finances-front

App Expo (Expo Router + TypeScript) para la herramienta de seguimiento de gastos personales.
Corre en **web, iOS y Android** con el mismo código. Por ahora es mínima: una pantalla que
verifica la conexión con `finances-back` (`GET /up`). Las pantallas se van sumando a medida
que avanza la capacitación del back.

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
  app/          pantallas (Expo Router: cada archivo es una ruta)
  api/          cliente fetch (URL, token, errores de la API)
  components/   StatusView (cargando / error + reintentar)
  hooks/        useFetch
  config.ts     URL de la API y token
  theme.ts      colores
```
