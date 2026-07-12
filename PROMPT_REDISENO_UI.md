# Prompt para rediseño UI/UX — Server Check (SaaS de monitoreo de uptime)

> Copiá todo este archivo en el prompt, adjuntá el código del repo (o los archivos que te pida a continuación)
> y las fotos/capturas de referencia de estilo. Reemplazá `[ADJUNTAR FOTOS ACÁ]` por las imágenes reales.

---

## 1. Qué es esta app

Es una aplicación SaaS de **monitoreo de uptime de servidores** (estilo Better Uptime / UptimeRobot / Datadog Synthetics / Atlassian Statuspage): los usuarios registran URLs, el sistema las chequea periódicamente, y el dashboard muestra estado (UP/DOWN/PENDING), historial de disponibilidad, incidentes, y estadísticas.

- **Frontend**: Next.js 16 (App Router) + React 19, TypeScript estricto.
- **Estilos actuales**: Tailwind CSS 4 está instalado y configurado (`@tailwindcss/postcss`) pero es **dependencia muerta** — no hay un solo `@theme`/utility class real en uso en toda la app. `app/globals.css` solo define `--font-sans` (Inter) y `--font-mono` (JetBrains Mono) como variables globales. El resto del estilado real está repartido en **~30 archivos `.scss` independientes**, uno por componente/página (`ComponentName.scss` junto a `ComponentName.tsx`, sintaxis Dart Sass con `@use`), cada uno con sus propias variables `$color-x`/`$radius-x` redeclaradas localmente, sin compartir nada entre sí.
- **Dos paletas oscuras que no coinciden**: el landing (`app/App.scss`) define un tema oscuro tipo GitHub (`$bg-landing: #0d1117`, `$accent-primary: #2A22C7`, `$accent-secondary: #3BD671`), y el shell del dashboard (`StructureDashboard.scss`) define su propio tema oscuro con otros valores (`$border-color: #2d3748`, `$color-background-section: #15222C`) — son dos sistemas de color no reconciliados entre sí, no una sola identidad de marca.
- **No existe un design system real**: no hay componentes primitivos reutilizables (`Button`, `Card`, `Input`, `Modal`, `Badge`, etc.) con una API consistente — cada feature define su propio look repitiendo (o divergiendo) el estilo de las demás.
- **Copy mezclado**: hay textos en español e inglés mezclados en la misma UI (ej. "Barra lateral de navegación" junto a "Monitor HTTP / sitio web" en otros lados en inglés) — no es parte del rediseño visual en sí, pero si notás inconsistencias de idioma al tocar un componente, dejalas señaladas en vez de decidir vos a cuál idioma migrar todo.
- **Estructura del código** (no la toques, es intencional):
  - `app/` → rutas del App Router únicamente (páginas, layouts). Rutas actuales: landing (`app/page.tsx`), `auth/login`, `auth/register`, `auth/validate-email`, `dashboard/home` (lista de monitores + detalle `[id]/details` + edición `[id]/edit` + alta `new/http`), `dashboard/incidents`, `dashboard/servers`, `dashboard/settings`.
  - `presentation/components/` → toda la UI: `auth/` (LoginForm, RegisterForm, ValidateEmailForm, AuthCard, PasswordRequirementsIndicator), `Dashboard/` (CardUptime, StatusUptimes, ChartStatsLastDay, DetailsUptime/, Incidents/, LogoutProfile, Categories), `Landing/` (Hero, Features, CTA, Footer, Logos, Metrics, Navbar, Testimonials), `Filters/`, `MonitorWizard/`, `MonitorAvailabilityChart/`, `shared/` (LoadingState, ErrorState, Toast), `Structures/` (shells de página), `Errors/`.
  - `presentation/hooks/` y `infraestructure/` → lógica de datos, **no relacionados con el diseño**, no deberían necesitar cambios funcionales.

## 2. El pedido

Quiero que **rediseñes visualmente toda la aplicación** para que se vea **profesional, "enterprise-grade"** — al nivel de productos SaaS B2B serios (Linear, Vercel, Datadog, Grafana Cloud, Better Stack). Hoy funciona bien pero el diseño es inconsistente, amateur y sin un sistema detrás.

**Guiate por las fotos que te adjunto** como referencia principal de estilo (paleta, tipografía, densidad, tono visual, componentes tipo card/tabla/badge, etc.). Donde las fotos no cubran un caso específico de esta app (por ejemplo un estado de "incidente activo" o un wizard de alta de monitor), usá tu criterio para extender ese mismo lenguaje visual de la forma más coherente y profesional posible — priorizo que el resultado final sea excelente y consistente por sobre seguir instrucciones literales mías si hay tensión entre ambas cosas.

[ADJUNTAR FOTOS ACÁ]

## 3. Qué espero que entregues

1. **Un sistema de diseño real**, no parches por componente:
   - Paleta de color completa (base + estados semánticos: success/up, error/down, warning/pending, info), con soporte para modo claro y oscuro si las fotos de referencia lo sugieren.
   - Escala tipográfica, escala de espaciado, radios de borde, sombras/elevación — como tokens reutilizables (variables CSS y/o config de Tailwind), no valores sueltos repetidos en cada `.scss`.
   - Decidí vos si conviene migrar el estilado a Tailwind puro (ya está instalado y prácticamente sin usar), mantener SCSS pero centralizando tokens compartidos, o un híbrido — elegí lo que dé el mejor resultado y la migración más ordenada, explicá brevemente tu decisión.
2. **Componentes primitivos reutilizables** (Button, Card, Badge/StatusPill, Input, Table, Modal/Dialog, Toast, etc.) que reemplacen los estilos duplicados actuales.
3. **Rediseño de las pantallas clave**, manteniendo toda la funcionalidad y estructura de rutas/props actual:
   - Landing page completa (Hero, Features, Metrics, Testimonials, Logos, CTA, Footer, Navbar).
   - Login / Register / Validate email.
   - Dashboard home (lista de monitores, cards de estado, filtros/orden).
   - Detalle de un monitor (stats overview, gráfico de disponibilidad, incidentes recientes).
   - Alta de monitor (wizard) y edición.
   - Incidentes (tabla + filtros).
   - Settings.
4. Código listo para integrar: componentes de React/TSX + estilos, respetando TypeScript estricto y la separación `app/` (rutas) vs `presentation/components/` (UI) del proyecto.

## 4. Restricciones importantes

- **No cambies lógica de negocio, hooks, llamadas a API, ni validaciones** (Zod, react-hook-form) — esto es un rediseño visual, no una reescritura funcional.
- **No rompas los tests existentes** más de lo estrictamente necesario por cambios de estructura DOM/clases; si un cambio visual obliga a tocar un test, indicalo explícitamente.
- Mantené accesibilidad razonable (contraste de color AA como mínimo, estados de foco visibles, roles/aria en componentes interactivos).
- Responsive: la app se usa tanto en desktop (dashboard denso) como en mobile (debe seguir siendo usable, no solo "no roto").
- El resultado debe sentirse como **un solo producto coherente**, no una colección de pantallas con estilos distintos.
