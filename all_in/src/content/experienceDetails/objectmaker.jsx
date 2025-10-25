export function ObjectMakerDetail() {
  return (
    <>
      <p>
        🧠 Object Maker is a workspace for structured creativity. Start with a conversational brief and the assistant
        drafts JSON schemas that describe imaginative artifacts—anything from a pizza, to a track-ready car, to a
        curated ice cream flight. Once the schema looks right, you can call the
        <code className="rounded bg-slate-900/80 px-1 py-0.5 text-[0.7rem] text-white">/obj</code> endpoint to spin up
        dozens of variants that adhere to the structure. The workflow is grounded in Groq hosted
        <span className="font-medium"> openai/gpt-oss-20b</span> and <span className="font-medium">openai/gpt-oss-120b</span>
        models, keeping generation fast while your schema evolves. ⚙️
      </p>
      <p>
        Each session curates a “Zoo” of finished creations so you can revisit, iterate, and compare outputs. The aim is
        to demonstrate how reliable JSON scaffolding unlocks downstream tooling: the sharper the schema, the more
        dependable the generated objects. Image generation integrations are planned, but today is about perfecting the
        structured prompt. 🗂️
      </p>
    </>
  )
}
