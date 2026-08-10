# Capstone UNO — REST API


🔗 **Repositorio / Repository:** [ https://gitlab.com/jala-university1/cohort-5/ES.CSPR-244.GA.T2.26.M1/SC/laboratorios-p4/adriana-monica-escobar-plaza/capstone-uno.git ]

---

## Selecciona tu idioma / Choose your language

<p align="center">
  <a href="#-versión-en-español"> Español</a> &nbsp;|&nbsp;
  <a href="#-english-version"> English</a>
</p>
---

##  English Version

###  Description

REST API for managing a UNO card game (players, games, cards, and scores), built with **Node.js + Express**, using **Sequelize ORM** on top of a **MySQL** database running inside a **Docker** container.

Here official websites the app or languages you need:
[![Node.js](https://img.shields.io/badge/Node.js-Express-green)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/Docker-MySQL-blue)](https://www.docker.com/)
[![Sequelize](https://img.shields.io/badge/ORM-Sequelize-lightgrey)](https://sequelize.org/)

### Project architecture

The project follows a layered architecture (Data Access / Logic / Presentation):

```
capstone-uno/
├── coverage/
├── node_modules/
├── src/
│   ├── dataAccess/
│   │   ├── models/
│   │   │   ├── cards.model.js
│   │   │   ├── game.model.js
│   │   │   ├── gamePlayer.model.js
│   │   │   ├── index.js
│   │   │   ├── player.model.js
│   │   │   └── score.model.js
│   │   ├── repositories/
│   │   │   ├── cards.repository.js
│   │   │   ├── game.repository.js
│   │   │   ├── gamePlayer.repository.js
│   │   │   ├── player.repository.js
│   │   │   └── score.repository.js
│   │   └── database.js
│   ├── helpers/
│   │   ├── composeAsyncValidators.js
│   │   ├── handleResult.js
│   │   └── unoDeck.js
│   ├── logic/
│   │   ├── monads/
│   │   │   └── result.js
│   │   ├── services/
│   │   │   ├── auth.service.js
│   │   │   ├── cards.service.js
│   │   │   ├── game.service.js
│   │   │   ├── player.service.js
│   │   │   └── score.service.js
│   │   └── validators/
│   │       ├── authRules.js
│   │       ├── authValidator.js
│   │       ├── cardsRules.js
│   │       ├── cardValidator.js
│   │       ├── gameRules.js
│   │       ├── gameValidator.js
│   │       ├── playerRules.js
│   │       ├── playerValidator.js
│   │       ├── scoreRules.js
│   │       └── scoreValidator.js
│   ├── middlewares/
│   │   ├── appError.js
│   │   ├── auth.middleware.js
│   │   └── errorHandler.middleware.js
│   └── presentation/
│       ├── controllers/
│       │   ├── cards.controller.js
│       │   ├── game.controller.js
│       │   ├── player.controller.js
│       │   └── score.controller.js
│       └── routes/
│           ├── cards.router.js
│           ├── game.router.js
│           ├── player.route.js
│           └── score.router.js
├── test/
├── app.js
├── docker-compose.yml
├── package.json
├── README.md
└── server.js

```

- **dataAccess:** Sequelize models and repositories (data access layer).
- **logic/services:** business logic.
- **presentation:** controllers and routes (HTTP layer).
- **middlewares:** centralized error handling.
- **helpers:** utilities such as the response handler.

This DataAccess use the index conected model and repositories with the service, index.js made the relation with the models, this is similar a factory.

Then Logic and services use controller for manage the errors and this to call for route and app

###  Prerequisites

Before starting, make sure you have installed:

| Tool | Official download |
|---|---|
|  Docker Desktop | https://www.docker.com/products/docker-desktop/ |
|  Node.js (LTS) | https://nodejs.org/en/download |
|  Visual Studio Code | https://code.visualstudio.com/download |
|  Postman | https://www.postman.com/downloads/ |

###  Step-by-step installation

**1. Clone the repository**

```bash
git clone https://gitlab.com/jala-university1/cohort-5/ES.CSPR-244.GA.T2.26.M1/SC/laboratorios-p4/adriana-monica-escobar-plaza/capstone-uno.git

cd capstone-uno
```

**2. Install dependencies**

```bash
npm install
```

**3. Check that port 3307 is free**

This project maps MySQL to local port **3307** (to avoid conflicts with a local MySQL install on 3306). Verify it's available:

```bash
# Windows (PowerShell)
netstat -ano | findstr 3307

# Linux / Mac
sudo lsof -i :3307
```

If the port is in use, free it up or change the port mapping in `docker-compose.yml`.

**4. Create the `.env` file**

In the project root, create a `.env` file with the following example content:

```env
# Server configuration
PORT=3000
NODE_ENV=development
#MySQL -> connection
DB_PORT=3307
DB_NAME=Unogame_db
DB_USER=username
DB_PASSWORD=password
DB_HOST=127.0.0.1
DB_DIALECT=mysql
#JWT
JWT_SECRET=password
JWT_EXPIRES_IN=1h
```

> ⚠️ Adjust these values to match your `docker-compose.yml` configuration.

**5. Start the database container with Docker**

```bash
docker-compose up -d
```

This will create and run the MySQL container in the background. Confirm it's running with:

```bash
docker ps
```

**6. Start the API server**

```bash
npm run dev
```

**7. Access the API**

Go to the following address in your browser or HTTP client:

```
http://localhost:3000/api
```
# Postman collection
1. Download the collection file: [https://drive.google.com/drive/folders/1UjeMDE55NhjNVnOP0tAGAKIAeFnU9GBA?usp=sharing]
2. Open Postman → **Export** → paste the link or select the downloaded file.


###  Available endpoints

**Players**
| Method | Endpoint |
|---|---|
| GET | `/api/players` |
| GET | `/api/players/:id` |
| POST | `/api/players` |
| PUT | `/api/players/:id` |
| DELETE | `/api/players` |

**Games**
| Method | Endpoint |
|---|---|
| GET | `/api/games` |
| GET | `/api/games/:id` |
| POST | `/api/games` |
| PUT | `/api/games` |
| DELETE | `/api/games` |
| POSTSTATE | `/api/games/state` |
| POSTPLAERS | `/api/games/players` |
| POSTCurrent-Players | `/api/games/current-players` |


**Cards**
| Method | Endpoint |
|---|---|
| GET | `/api/cards` |
| GET | `/api/cards/:id` |
| POST | `/api/cards` |
| PUT | `/api/cards/:id` |
| DELETE | `/api/cards/:id` |
| GET | `/api/games/top-card` |

**Scores**
| Method | Endpoint |
|---|---|
| GET | `/api/scores` |
| GET | `/api/scores/:id` |
| POST | `/api/scores` |
| PUT | `/api/scores/:id` |
| DELETE | `/api/scores/:id` |

### Important Details about the poryect

* **Note on the Card Deck:** The deck is not generated when a game is created (`POST /api/games`). The first discard card is created lazily the first time `GET .../top-card` is requested: if `getTopCard` finds no card in `discard` for that `gameId`, `createInitCard` generates one on the fly with a random color and value (0–9). `helpers/unoDeck.js` already includes `buildDeck` (the full 108-card deck: numbers, `skip`/`reverse`/`draw_two`, wilds) and `shuffleDeck` (Fisher-Yates), intended for a future iteration where the full deck is generated and dealt automatically when the game is created, instead of creating cards one at a time.

* **Security & Authentication:** To create a game and perform authentication, an `access_token` is strictly required. This ensures enhanced game security, protects players' data, and provides better access management across all operations.
---

<p align="center"> Made with love, saliva, sweat, duct tape and lots of saliva for the Capstone UNO project.</p>
---