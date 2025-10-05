export const CLASSIFICATION_MODELS = [
  {
    id: 'openai/gpt-oss-20b',
    label: 'GPT-OSS 20B',
    dotClass: 'bg-emerald-500',
  },
  {
    id: 'openai/gpt-oss-120b',
    label: 'GPT-OSS 120B',
    dotClass: 'bg-indigo-500',
  },
  {
    id: 'moonshotai/kimi-k2-instruct-0905',
    label: 'Kimi K2 Instruct',
    dotClass: 'bg-amber-500',
  },
  {
    id: 'meta-llama/llama-4-maverick-17b-128e-instruct',
    label: 'Llama 4 Maverick',
    dotClass: 'bg-rose-500',
  },
  {
    id: 'meta-llama/llama-4-scout-17b-16e-instruct',
    label: 'Llama 4 Scout',
    dotClass: 'bg-cyan-500',
  },
];

export function getClassificationModelById(id) {
  if (!id) return null;
  return CLASSIFICATION_MODELS.find((model) => model.id === id) || null;
}
