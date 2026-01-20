# Web - Server Check App Frontend

## ¿Qué es?

Dashboard web moderno para visualizar y monitorear el estado de servidores en tiempo real. Es el frontend del sistema **Server Check App**, conectado al backend NestJS mediante APIs REST.

## Stack Tecnológico

| Tecnología | Versión | Descripción |
|------------|---------|-------------|
| **Next.js** | 16.1.1 | Framework React con App Router |
| **React** | 19.2.3 | Biblioteca UI con últimas features |
| **TypeScript** | 5.x | Tipado estático |
| **Tailwind CSS** | 4.x | Estilizado con nuevo motor CSS nativo |

## Características

- **Server Components por defecto**: Renderizado en servidor para mejor performance
- **Tailwind CSS 4**: Nueva versión con motor CSS nativo (sin PostCSS en la mayoría de casos)
- **TypeScript estricto**: Type safety en todo el código
- **Dark mode automático**: Detecta preferencia del sistema
- **Fuentes optimizadas**: Geist Sans y Geist Mono via `next/font`

## Estructura del Proyecto

```
apps/web/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Layout raíz (fuentes, metadata)
│   ├── page.tsx            # Homepage
│   └── globals.css         # Estilos globales + Tailwind
├── public/                 # Archivos estáticos
├── next.config.ts          # Configuración Next.js
├── tailwind.config.ts      # Configuración Tailwind
└── package.json            # Dependencias
```

## Empezando

### 1. Instalar dependencias

```bash
npm install
```

### 2. Iniciar servidor de desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

### 3. Construir para producción

```bash
npm run build
npm run start
```

## Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia servidor de desarrollo |
| `npm run build` | Compila para producción |
| `npm run start` | Inicia servidor de producción |
| `npm run lint` | Ejecuta ESLint |

## Arquitectura

### App Router

Este proyecto usa el **App Router** de Next.js (directorio `app/`):

- **Server Components**: Por defecto, sin `'use client'`
- **Client Components**: Agregar `'use client'` para interactividad
- **Route Groups**: Usar paréntesis `(auth)`, `(dashboard)` para layouts compartidos
- **Data Fetching**: `fetch()` con cache configurable

### Tailwind CSS 4

Nueva sintaxis con `@import "tailwindcss"`:

```css
/* app/globals.css */
@import "tailwindcss";

:root {
  --background: #ffffff;
  --foreground: #171717;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
}
```

### Dark Mode

Soporte automático via `prefers-color-scheme`:

```css
@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}
```

## Próximos Pasos

El proyecto está en etapa inicial. Próximas funcionalidades a implementar:

1. **Autenticación**: Login con AWS Cognito
2. **Dashboard**: Vista principal con lista de monitores
3. **Monitores**: CRUD de monitors (crear, editar, eliminar)
4. **Logs**: Visualización de ping logs históricos
5. **Real-time**: WebSocket para actualizaciones en vivo
6. **Charts**: Gráficos de uptime y response time

## Conexión con Backend

El backend NestJS corre en `http://localhost:4000` con endpoints bajo `/api/v1/`.

Ejemplo de fetch:

```typescript
async function getMonitors() {
  const res = await fetch('http://localhost:4000/api/v1/uptime', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}
```

## Deploy

### Vercel (Recomendado)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Docker

```bash
docker build -t server-check-web .
docker run -p 3000:3000 server-check-web
```

## Recursos

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS 4 Docs](https://tailwindcss.com/docs)
- [React 19 Docs](https://react.dev)

## Autor

- **Lucas Cabral** - [GitHub](https://github.com/Lucascabral95)

---

Parte del monorepo **Server Check App**.
