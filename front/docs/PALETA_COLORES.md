# Sistema de diseño — Paletas Turnero

Referencia visual interactiva: [`paletas_negro_turnero.html`](./paletas_negro_turnero.html)

El **panel admin/profesional** de cada comercio usa **modo oscuro por defecto** y permite elegir una de tres paletas de acento. El portal público de reservas usará modo claro (fase posterior); no comparte el selector de paleta del panel.

---

## Paletas disponibles

| ID (`data-tema`) | Nombre | Perfil | Rubros sugeridos |
|------------------|--------|--------|------------------|
| `lima` | Negro & lima eléctrico | Premium, alta energía, tech | Barberías modernas, startups, estética urbana |
| `naranja` | Negro & naranja quemado | Elegante, cálido, artesanal | Barberías clásicas, estética, salud |
| `violeta` | Negro & violeta | Sofisticado, calma, distinto | Psicología, nutrición, consultorios |

---

## Tokens por paleta

### 1 — Lima (`lima`)

| Token | Modo claro | Modo oscuro |
|-------|------------|-------------|
| Fondo | `#F7F7F5` | `#0A0A0A` |
| Superficie | `#FFFFFF` | `#1A1A1A` |
| Primario | `#111111` | `#111111` |
| Acento | `#C8F135` | `#C8F135` |
| Borde / hover | `#E0E0DC` | `#2A2A2A` |
| Texto | `#111111` | `#F0F0F0` |
| Texto muted | `#666666` | `#888888` |
| Sidebar fondo | `#111111` | `#0A0A0A` |
| Nav activo | `#1E1E1E` | `#1E1E1E` |

### 2 — Naranja (`naranja`)

| Token | Modo claro | Modo oscuro |
|-------|------------|-------------|
| Fondo | `#F8F5F2` | `#080808` |
| Superficie | `#FFFFFF` | `#161616` |
| Primario | `#0F0F0F` | `#0F0F0F` |
| Acento | `#D95F1A` | `#E8702A` |
| Borde | `#E8DDD5` | `#242424` |
| Texto | `#0F0F0F` | `#F0EDE8` |
| Texto muted | `#7A6A5A` | `#888888` |
| Sidebar fondo | `#0F0F0F` | `#080808` |
| Nav activo | `#1A1A1A` | `#1A1A1A` |

### 3 — Violeta (`violeta`)

| Token | Modo claro | Modo oscuro |
|-------|------------|-------------|
| Fondo | `#F6F5F9` | `#090910` |
| Superficie | `#FFFFFF` | `#14131F` |
| Primario | `#111111` | `#111111` |
| Acento | `#7C5CBF` | `#9B7ED4` |
| Acento claro | `#A98EE0` | `#A98EE0` |
| Borde | `#E2DFEE` | `#1E1C2E` |
| Hover nav | `#DDD9EE` | `#3D3660` |
| Texto | `#111111` | `#EEEAF8` |
| Texto muted | `#6A6480` | `#7870A0` |
| Sidebar fondo | `#111111` | `#090910` |
| Nav activo | `#1E1C2E` | `#1E1C2E` |

---

## Colores semánticos (estados de turno)

Igual en las tres paletas — no compiten con el acento de marca.

### Modo claro

| Estado | Fondo | Texto |
|--------|-------|-------|
| Confirmado | `#D1FAE5` | `#065F46` |
| Pendiente | `#FEF3C7` | `#92400E` |
| Cancelado | `#FEE2E2` | `#991B1B` |

### Modo oscuro

| Estado | Fondo | Texto |
|--------|-------|-------|
| Confirmado | `#052E16` | `#6EE7B7` |
| Pendiente | `#3B2A00` | `#FDE68A` |
| Cancelado | `#450A0A` | `#FCA5A5` |

---

## Uso en frontend

### CSS

Las variables viven bajo `.panel-comercio[data-tema][data-modo]`. Ver `src/styles/temas/`.

```html
<div class="panel-comercio" data-tema="lima" data-modo="oscuro">
  <!-- layout panel admin -->
</div>
```

### Angular

```typescript
import { TemaPanelService } from '@app/core/services/tema-panel.service';

// Por defecto: paleta lima, modo oscuro
temaPanel.establecerPaleta('naranja');
temaPanel.establecerModo('oscuro');
temaPanel.aplicarEnElemento(elementoHost); // al montar layout panel
```

Preferencias guardadas en `localStorage` (`turnero-panel-paleta`, `turnero-panel-modo`).

### Bootstrap en panel

Dentro de `.panel-comercio`, botones primarios usan `--color-acento`. Cards y sidebar usan `--color-superficie` y `--color-borde`.

---

## Alcance por zona de la app

| Zona | Tema | Modo default |
|------|------|--------------|
| Panel admin / profesional | Elegible por comercio (3 paletas) | **Oscuro** |
| Portal público reservas | Neutro / marca comercio (futuro) | Claro |
| Portal Mis turnos cliente | Neutro (futuro) | Claro |
| SuperAdmin | Paleta fija o propia (futuro) | Oscuro |

---

## Futuro (BD)

Campo opcional en `comercios`: `paleta_ui` enum (`lima` | `naranja` | `violeta`) para persistir la elección del admin por tenant.
