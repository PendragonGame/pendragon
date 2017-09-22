# Design Interface

# Game Logic
> Leaders: @brian (frontend) and @ram (Backend)

## Sprites
- Have sprites maintain an inheritance. This could be an example:
```
  Phaser.Sprite:
      - Entity:
        - NPC
          - Monster
          - Normal NPC
          - Quest NPC
        - Player
    # This can be edited, but the rest of the document is taking this as an example.
```
  - (@ram) In the backend, maintain a list of `Entities`, i.e., maintain a list of all active `Monsters`, `Quest`/`Normal` NPCs, and obviously, we have access to the `Player`.

# Conventions
- Google JavaScript Style Guide: https://google.github.io/styleguide/jsguide.html
- ESLint for correction.
  - https://github.com/eslint/eslint
  - https://github.com/AtomLinter/linter-eslint
  - https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint
- JSDocs for comments and documentation
  - http://usejsdoc.org/
  - https://atom.io/packages/docblockr
  - https://marketplace.visualstudio.com/items?itemName=joelday.docthis
- Commit message conventions:
  - https://chris.beams.io/posts/git-commit/

