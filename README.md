---
title: Tetris
emoji: 🧱
colorFrom: yellow
colorTo: blue
sdk: static
pinned: false
---

# Tetris

Classic Tetris, ready to play. Stack falling tetrominoes, clear lines, and keep the well from filling up.

The interface follows the browser language. There is no language picker. Simplified Chinese, Taiwan, Hong Kong, and Macau each have their own wording. Major languages such as English, Japanese, German, French, and Spanish have their own locale packs. If the browser language is not in the list, the UI uses English (United States).

## How to play

- Pieces fall from the top of a 10×20 well. Move, rotate, and drop them into place.
- A full row disappears and scores points. Clearing several rows at once scores more.
- Scoring follows the classic NES table (40 / 100 / 300 / 1200), multiplied by the current level.
- Level goes up every 10 lines. Soft drop and hard drop also add a little score.
- The next piece is shown in the side panel. Pieces come from a 7-bag randomizer.
- When a new piece cannot spawn, the round is over.

## Controls

### Desktop

| Action | Keys / method |
|------|-------------|
| Move left / right | **← →** |
| Rotate | **↑**, **W**, or **X** |
| Soft drop | **↓** |
| Hard drop | **Space** |
| Pause / resume | **P** or **Esc** |
| Start / confirm | **Enter**, click the board, or the **Start** button |

### Phone / touch

| Action | Method |
|------|------|
| Move | On-screen **left / right** buttons (hold to repeat) |
| Rotate | **Rotate** button |
| Soft drop | **Down** button |
| Hard drop | **Hard drop** button |
| Pause / resume | **Pause** button, or tap the board |
| Start / continue / back | **Tap the board**, or the **Start** button |

Speed, cabinet theme, board color, and sound stay on this device. Switching to another app pauses the game.

> Tip: Speed can only be changed on the title screen or after a game over. A toast appears if you try to change it mid-round.

## Speed modes

Pick a speed before a round. **You cannot change speed during a round**:

| Mode | Feel |
|------|------|
| Slow | Relaxed pace, good for learning the controls |
| Normal | Default drop speed |
| Fast | You need to keep up |
| Turbo | Fast drops, short reaction window |
| Insane | Extreme challenge |

Each speed keeps **its own high score**. High scores stay on this device after a refresh.

## Extra features

- **Pause**: freeze the well, then continue from the same position.
- **Themes**: several cabinet skins (classic, purple, green, blue, pink, arcade).
- **Board color**: a separate picker for the well background.
- **Sound**: Web Audio move, rotate, drop, line-clear, and game-over cues, with a mute toggle.
- **CRT look**: scanlines on the playfield for a retro cabinet feel.
- **New record**: beat the high score for the current speed and the overlay shows **New record**.
- **Restart**: returns to the idle title screen instead of starting a new round immediately.

## Start a game

1. (Optional) Pick a speed, theme, and board color
2. Click **Start**, press Enter, or tap the board
3. Clear lines, raise the level, and chase a higher score
4. Game over? Go back to the title screen and play again

Have fun, and keep those lines clearing 🧱
