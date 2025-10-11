export default function FlagFoundryHeroContent() {
  return (
    <div className="space-y-3">
      <p className="text-base text-white/90">
        🚩 Flag Foundry stress-tests the <code className="rounded bg-white/10 px-1 py-0.5">/svg</code> route by rebuilding
        national flags at a controlled pace, showing how an LLM keeps the required shapes and color rules in line.
      </p>
      <p className="text-sm text-white/80">
        Queue flag prompts for the SVG worker and it streams a new European flag every two seconds, paired with the Unicode
        reference for quick accuracy checks.
      </p>
      <p className="text-sm text-white/80">
        🧠 This page looks at how much flag detail{' '}
        <a
          href="https://en.wikipedia.org/wiki/LLaMA_(language_model)"
          className="underline decoration-dotted underline-offset-2 text-white transition hover:text-white/80"
          target="_blank"
          rel="noreferrer"
        >
          LLaMA&nbsp;3&nbsp;70B
        </a>
         &nbsp;can recover within a 1024-token budget. Simple layouts are easy wins; intricate layouts push the limit.
      </p>
    </div>
  )
}
