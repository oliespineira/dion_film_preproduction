# Tablero de Preproducción

App multi-proyecto para fichas de personajes y localizaciones, pensada para
desplegarse online y que cada usuario tenga sus propios proyectos.

Stack: **React + Vite** en el frontend, **Supabase** (Postgres + Auth) como
backend — así no hace falta escribir ni mantener un servidor propio.

## 1. Crear el proyecto en Supabase

1. Entra en https://supabase.com y crea un proyecto nuevo (plan gratuito).
2. Ve a **SQL Editor** → **New query**, pega el contenido de
   `supabase/schema.sql` y ejecútalo. Esto crea las tablas `projects`,
   `characters` y `locations`, y las políticas de seguridad (RLS) que hacen
   que cada usuario solo vea sus propios datos.
3. Ve a **Project Settings → API** y copia la **Project URL** y la
   **anon public key**.
4. (Opcional, para probar más rápido) En **Authentication → Providers →
   Email**, desactiva "Confirm email" si no quieres validar el correo en cada
   prueba durante desarrollo. Vuelve a activarlo antes de lanzar a usuarios
   reales.

## 2. Configurar el proyecto local

```bash
cp .env.example .env
# edita .env y pega tu URL y tu anon key

npm install
npm run dev
```

Abre `http://localhost:5173`. Crea una cuenta desde la propia pantalla de
login (usa cualquier correo/contraseña; con la confirmación desactivada
entras directamente).

## 3. Desplegar online

Cualquier hosting de sitios estáticos vale (Vercel, Netlify, Cloudflare
Pages...). Con Vercel, por ejemplo:

1. Sube esta carpeta a un repositorio de GitHub.
2. En Vercel: **New Project** → importa el repo.
3. En **Environment Variables** añade `VITE_SUPABASE_URL` y
   `VITE_SUPABASE_ANON_KEY` con los mismos valores que en tu `.env`.
4. Deploy. Listo — cualquier persona que entre podrá crear su cuenta y sus
   propios proyectos, aislados de los demás gracias a las políticas RLS.

## Estructura del proyecto

```
src/
  lib/supabaseClient.js     cliente de Supabase
  context/AuthContext.jsx   sesión, login, registro, logout
  hooks/useProjects.js      listar/crear/borrar proyectos
  hooks/useBoard.js         listar/crear/editar/borrar fichas del proyecto activo
  components/               UI: tablero, tarjetas, modales, formularios
  styles/theme.css          tema visual (corcho, madera, fichas de papel)
supabase/schema.sql         tablas + seguridad a nivel de fila
```

## Próximos módulos

Esta es la primera pieza (fichas de personajes y localizaciones) de la
plataforma. Los siguientes módulos —desglose de guion por escena, guion
técnico/shotlist, citaciones y horarios— pueden añadirse como tablas nuevas
en Supabase (relacionadas con `projects`) y pantallas nuevas dentro de
`src/components/`, reutilizando el mismo selector de proyecto y el mismo
sistema de autenticación.
