# AGENTS.md

## Project Overview

This is an interactive simulation of a surfer on a beach, created in the spirit of "The Nature of Code" by Daniel Shiffman. The simulation is built using the p5.js library. The primary goal is to simulate realistic and engaging interactions between the surfer and the environment, particularly the waves, which respond to user input.

## File Structure

- `index.html`: The main HTML file that loads the p5.js library and the `sketch.js` script. It also contains basic styling to make the canvas fill the screen.
- `sketch.js`: This is the heart of the project. It contains all the p5.js code, including the main `setup()` and `draw()` loops, all class definitions (`Surfer`, `Particle`, `ParticleSystem`), and all logic for physics, drawing, and interaction.

## Core Concepts & Implementation Details

### Waves

- **Generation:** The waves are generated using 2D Perlin noise (`noise(xoff, yoff)`). The x-offset (`xoff`) corresponds to the position along the width of the canvas, and the y-offset (`yoff`) is incremented over time to create the animation of flowing waves.
- **Interaction:** Pressing any key increases the `targetWaveAmplitude`. The `waveAmplitude` smoothly interpolates (`lerp`) towards this target, making the waves grow. The `targetWaveAmplitude` then slowly `lerp`s back to the `baseWaveAmplitude`, causing the waves to calm down.
- **Foam:** Foam is drawn on the crests of larger waves using another layer of Perlin noise to create a more natural, randomized appearance.

### Surfer and Physics

- **`Surfer` Class:** This class is a classic "Mover" object from "The Nature of Code". It manages its own `position`, `velocity`, and `acceleration` vectors.
- **Forces:** All movement is driven by forces. In each frame of the `draw()` loop, forces are applied to the surfer using its `applyForce()` method. The main forces are:
    1.  **Gravity:** A constant downward force.
    2.  **Buoyancy:** An upward force applied when the surfer is below the water level.
    3.  **Drag:** A force that opposes velocity, applied when the surfer is in the water to dampen movement.
    4.  **Wave Push:** A force aligned with the angle of the wave at the surfer's position, which makes the surfer "ride" the wave.
- **Interaction with Waves:** The functions `getWaveY(x)` and `getWaveAngle(x)` are critical. They calculate the precise height and angle of the wave at any given x-coordinate, allowing the physics engine to determine how the surfer should interact with the water.

### Visuals

- **Particle System:** A simple particle system (`ParticleSystem` and `Particle` classes) is attached to the surfer to create a water spray effect when it moves through the water.
- **Rotation:** The surfer's surfboard is visually aligned with the angle of the wave it is on for a more realistic look.

## Guidelines for Future Development

- **Maintain the "Nature of Code" Style:** When adding new objects or behaviors, try to think in terms of vectors and forces. New interactive elements should ideally have their own classes.
- **Adding Forces:** To add new forces (e.g., wind), simply calculate the force vector in the `draw()` loop and apply it to the surfer using `surfer.applyForce(newForce)`.
- **Modifying Physics:** The physics parameters (gravity, force magnitudes, etc.) are currently hardcoded constants. Consider exposing them as variables at the top of the file for easier tuning.
- **Performance:** The current implementation recalculates the entire wave shape for drawing and then re-calculates parts of it for physics. If performance becomes an issue, consider optimizing by storing the wave vertex data in an array each frame.
- **Testing:** Since this is a visual project, there are no automated tests. After making changes, visually inspect the simulation to ensure that the physics are still behaving as expected and that there are no visual glitches.
