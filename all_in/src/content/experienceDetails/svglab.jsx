export function SvgLabDetail() {
  return (
    <>
      <p>
        🎨 SVG Prompt Lab turns the paint-by-text demo into a polished studio. Type instructions (“draw a rocket in a
        frame, make the stars sparkle”) and the UI relays them to the
        <code className="rounded bg-slate-900/80 px-1 py-0.5 text-[0.7rem] text-white">/svg</code> worker route. The JSON
        response includes the raw markup and a ready-to-use data URL so you can preview the artwork in seconds.
      </p>
      <p>
        Every generation automatically lands in a cookie-backed gallery. Tap a tile to reload its markup, copy the SVG
        source, and remix the prompt. It is a fast way to prototype iconography or onboarding illustrations while the
        LLM does the coordinate math for you. ✍️
      </p>
    </>
  )
}
