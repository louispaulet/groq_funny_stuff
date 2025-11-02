export function QAArenaDetail() {
  return (
    <div className="space-y-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
      <p>
        QA Arena spins up a random topic from a curated Wikipedia benchmark list, pulls the article summary, and asks an oss-120B
        quizmaster to craft five multiple-choice questions. Each question includes four labelled options and a correct answer key,
        keeping the /obj payloads lean enough for rapid-fire battles.
      </p>
      <p>
        Once the quiz is staged, Model A (oss-20B) and Model B (oss-120B) take turns answering via /obj requests. Five-second
        cooldowns between each call prevent rate-limit skirmishes and power a live countdown component that fuels the suspense.
        Answers instantly light up in blue and red, with points awarded per correct pick and totals rolling into a category
        scoreboard.
      </p>
      <p>
        The interface preserves the last five questions in a highlight reel, shows the Wikipedia abstract in a collapsible panel,
        and keeps cumulative standings by domain (math, space, history, and more) until you choose to reset the scoreboard. It’s a
        playful benchmarking hub that demonstrates structured outputs, pacing controls, and Groq-speed trivia duels.
      </p>
    </div>
  )
}
