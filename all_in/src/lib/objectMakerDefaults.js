export const DEFAULT_SYSTEM_PROMPT = 'You are an object maker. Produce a single JSON object that strictly conforms to the provided JSON Schema. Do not include commentary or markdown. Only return the JSON object.'

export const DEFAULT_STRUCTURE = {
  type: 'object',
  additionalProperties: false,
  properties: {
    name: { type: 'string' },
    size: { type: 'string', enum: ['small', 'medium', 'large'] },
    crust: { type: 'string' },
    cheese: { type: 'string' },
    toppings: { type: 'array', items: { type: 'string' } },
  },
  required: ['name', 'size', 'crust', 'cheese', 'toppings'],
}

export const DEFAULT_STRUCTURE_TEXT = JSON.stringify(DEFAULT_STRUCTURE, null, 2)
export const DEFAULT_OBJECT_PROMPT = 'make a delicious spicy pizza that respects this schema'
export const DEFAULT_OBJECT_TYPE = 'pizza'
export const DEFAULT_OBJECT_NAME = ''
