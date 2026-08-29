# Capstone UNO — Frontend (base)

Base React + CSS plano para login/register y el dashboard con la barra
lateral y el menú horizontal. Sigue el plan que ya estaba documentado en
`docs/PROJECT_SUMMARY.md` sección 8 (CSS con variables, convención BEM,
GameContext) — esto es esa base implementada, más las pantallas de auth.

## Dónde ponerlo

Este `frontend/` es un proyecto aparte, hermano de `capstone-uno/` (el
backend), no una carpeta adentro de `src/` del backend:

```
adriana-monica-escobar-plaza/
├── capstone-uno/        # tu backend, tal cual está
└── frontend/            # esto — carpeta nueva, mismo nivel
```

Copiá todo el contenido de este paquete a esa carpeta `frontend/` nueva.

## Instalación

```bash
cd frontend
npm install
cp .env.example .env      # ajustá VITE_API_URL si tu backend no corre en :3000
npm run dev
```

## Qué archivo es cada cosa

| Archivo | Qué hace |
|---|---|
| `src/styles/variables.css` | Tokens de diseño: colores UNO, tipografías, espaciados. |
| `src/styles/app.css` | Todos los estilos, BEM, organizados por sección (auth, shell, topnav, sidebar, panels). |
| `src/api/client.js` | Wrapper de `fetch` — agrega el Bearer token y el `Content-Type`, y tira error legible si `res.ok` es falso. |
| `src/context/AuthContext.jsx` | Login/register/logout, guarda `{ token, player }` en `localStorage` bajo la key `uno_session`. |
| `src/context/GameContext.jsx` | Solo `activeGameId` por ahora — es la semilla del `GameContext` que ya tenías planeado para Socket.IO; se amplía ahí mismo cuando conectes el socket. |
| `src/pages/LoginPage.jsx` | Username + password, botón para pasar a Register. |
| `src/pages/RegisterPage.jsx` | Username + email + password, botón para volver a Login. Al registrar, hace login automático. |
| `src/pages/DashboardPage.jsx` | Arma el shell: `TopNav` + panel activo + `Sidebar`. `NAV_ITEMS` es la lista de botones — agregar un tab nuevo es un objeto más ahí y un panel más en `PANELS`. |
| `src/components/layout/TopNav.jsx` | La barra horizontal con los 8 botones. |
| `src/components/layout/Sidebar.jsx` | Perfil + score del juego activo (`GET /api/games/:id/score-game`), a la derecha. |
| `src/components/panels/*.jsx` | Un archivo por botón del top-nav — cada uno pega directo al endpoint REST que le corresponde (ver el comentario `panel__hint` adentro de cada uno). |
| `App.jsx` | Decide login vs. register vs. dashboard según si hay sesión. |

## Qué falta a propósito (no es parte de "la base")

- Los componentes reales de juego (`Card`, `PlayerHand`, `DiscardPile`,
  `TurnHistory`, `ScoreBoard`, `ColorPicker`, `UnoButton`) — siguen siendo
  la siguiente iteración, tal como estaba en `PROJECT_SUMMARY.md`.
- Conexión Socket.IO (`useGameSocket`) — `GameContext.jsx` ya tiene la forma
  lista para sumarlo sin romper nada de lo que usa `activeGameId` hoy.
- El panel "Current players" pega a `POST /api/games/players` (lista de
  jugadores en la partida). Si en realidad querías "de quién es el turno"
  (`POST /api/games/current-player`), avisame y lo separo en dos botones.
