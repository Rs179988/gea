# Repository Guidelines for GEA (Game Engine Anything)

## Core Philosophy

GEA treats video games as **deterministic dynamical systems**. 
Gameplay feel ("game juice", platformer tightness, jump arcs) is governed by exact mathematical constants.

1. **Kinematics Ground-Truth**: Extract jump gravity, apex hang-time, acceleration curves, and deceleration drag directly from trajectory point samples rather than arbitrary guessing.
2. **Platform Parity**: Mechanics extracted from gameplay traces must reproduce identically in modern target engines (Godot 4, Bevy, HTML5 Canvas).
3. **Clean-Room Implementation**: Never copy decompiled engine proprietary internals. Synthesize clean, idiomatic GDScript / TypeScript implementations based purely on mathematical state equations.
4. **Agent Integration**: All tools must be callable via CLI and MCP for autonomous game prototyping.
