export const gameOfLifeLabDetails = (
  <>
    <p>
      Conway&apos;s Game of Life is a zero-player cellular automaton where each generation springs from the last. A
      four-rule system lets gliders, pulsars, and guns emerge from simple seeds—no human steering. Brush up on the
      origin story on{' '}
      <a
        href="https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life"
        target="_blank"
        rel="noreferrer"
        className="font-semibold text-sky-600 underline-offset-2 transition hover:underline dark:text-sky-300"
      >
        Wikipedia
      </a>
      .
    </p>
    <p>
      The Game of Life Lab lets you dial in the matrix size, swap curated presets, and modulate the simulation clock
      from slow motion to warp speed. Centered seeds wrap around a toroidal grid so spaceships never fall off the edge.
    </p>
    <ul className="ml-4 list-disc space-y-2 text-slate-600 dark:text-slate-300">
      <li>Pause, resume, or step one generation at a time for frame-by-frame analysis.</li>
      <li>Track active-cell stats in real time to see how density shifts across the surface.</li>
      <li>Experiment with oscillators, glider guns, and looped spaceships in one quick workspace.</li>
    </ul>
  </>
)

export const gameOfLifeLabTags = ['cellular-automaton', 'toroidal-grid', 'live-controls']
