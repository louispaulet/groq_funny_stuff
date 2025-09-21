export default {
  "title": "CandidateTerms",
  "type": "object",
  "properties": {
    "terms": {
      "title": "Terms",
      "minItems": 1,
      "maxItems": 6,
      "type": "array",
      "items": {
        "type": "string"
      }
    }
  },
  "required": [
    "terms"
  ],
  "additionalProperties": false
};
