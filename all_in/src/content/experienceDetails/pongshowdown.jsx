export function PongShowdownDetail() {
  return (
    <>
      <p>
        🕹️ Pong Showdown is an autonomous rally where Groq-hosted LLAMA 4 models restyle the court in real time. Every
        paddle deflection or out-of-bounds point calls the
        <code className="rounded bg-slate-900/80 px-1 py-0.5 text-[0.7rem] text-white">/obj</code> endpoint with a schema
        demanding labeled colors and usage prompts. The response paints the background, paddles, ball, and scoreboard
        with fresh hex values the instant the rally continues.
      </p>
      <p>
        Use it as a living demo of structured outputs driving UI state. The paddles run on simple AI while the Groq
        workers keep the palette energetic and legible—perfect for showcasing how deterministic schemas and
        low-latency inference can remix an experience mid-game. 🎨
      </p>
    </>
  )
}
