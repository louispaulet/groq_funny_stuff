export default function FlagFoundryHeroContent() {
  return (
    <div className="space-y-3">
      <p className="text-base text-white/90">
        🚩 Flag Foundry is pitched like a FAANG lab demo: we throttle <code className="rounded bg-white/10 px-1 py-0.5">/svg</code>
        {" "}
        calls to rebuild national flags, showcasing how an LLM navigates vexillological structure inside a dense{' '}
        <a
          href="https://en.wikipedia.org/wiki/Latent_space"
          className="underline decoration-dotted underline-offset-2 text-white transition hover:text-white/80"
          target="_blank"
          rel="noreferrer"
        >
          latent space
        </a>
        {' '}with just enough flair to feel like a keynote teaser.
      </p>
      <p className="text-sm text-white/80">
        Queue flag prompts for the SVG worker, streaming a fresh European flag every two seconds with a Unicode reference so
        accuracy checks stay fast and grounded.
      </p>
      <p className="text-sm text-white/80">
        🧠 This page is about understanding what an LLM knows about a flag in a few tokens. The model is{' '}
        <a
          href="https://en.wikipedia.org/wiki/LLaMA_(language_model)"
          className="underline decoration-dotted underline-offset-2 text-white transition hover:text-white/80"
          target="_blank"
          rel="noreferrer"
        >
          LLaMA&nbsp;3&nbsp;70B
        </a>
        , operating under a 1024-token constraint — the simpler the flag, the easier it is to honor that boundary without
        smearing the hypothesis space.
      </p>
    </div>
  )
}
