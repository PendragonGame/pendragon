# Pendragon

Simply put, _**Pendragon**_ is just another single-player, RPG game. You will be a lone player who can interact with NPCs, and kill slimes and monsters. You will probably have a sword. If we feel like it. Meh...

But as uninteresting as _**Pendragon**_ seems, it is also kickass. Why, you ask? Brace yourself, because what follows is going to blow your mind...

> **We let the NPCs gossip about you.**

Confused? Are you wondering why that is, as we put it, **kickass**?

Most RPGs work this way.

1. Player completes quest.
1. Player reputation increases.
1. **Every NPC in the world knows about it immediately!!!**

Are you seriously telling me that NPCs have a _hive mind_! Obviously not, so we aim to solve that issue. The goal is to have NPCs in the vicinity acknowledge your actions as good or bad and then propagate them to the rest of the world via **gossip**. We like to call this **Ripple Gossip**.

## Want to play?

Head over to our [releases](https://github.com/PendragonGame/pendragon/releases) page and download the latest packaged app, extract it (if it is in a zip or tar file) and click on the app to run it (.app file for Mac, .exe for Windows, .AppImage and executable for Linux).

## Instructions for running on Windows:

1. Download the Windows 64-bit Zip on our [releases](https://github.com/PendragonGame/pendragon/releases) page 
1. Extract contents of the zip file
1. Open uncompressed folder and run pendragon.exe

## For Contributors

1. Clone the repo 
1. Change directories into the `src/` folder
1. `npm install` when in `src/` folder 
1. `npm start` to boot up the game

The source directory contains the following:

- `app/`: The frontend of the application running on [PhaserJS Community Edition](https://photonstorm.github.io/phaser-ce/)
  - `app.js`: Entry point for front end.
  - `states/`: The Phaser `States`
  - `entity/`: The `Entity` abstraction and its sub-classes.
  - `factory/`: The `Entity` factory abstraction.
- `main.js`: The backend main script
  - `data-store/`: The database manager.
