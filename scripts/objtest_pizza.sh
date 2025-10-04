#!/usr/bin/env bash
set -euo pipefail

OBJ_BASE_URL=${OBJ_BASE_URL:-https://groq-endpoint.louispaulet13.workers.dev}
OBJ_TYPE=${OBJ_TYPE:-pizza}
OBJ_TITLE=${OBJ_TITLE:-diavola}
OBJ_USER=${OBJ_USER:-cli-make-test}
SYSTEM_PROMPT=${SYSTEM_PROMPT:-"You are an object maker. Produce a single JSON object that strictly conforms to the provided JSON Schema. Do not include commentary or markdown. Only return the JSON object."}

schema_payload='{
  "schema": {
    "type": "object",
    "additionalProperties": false,
    "properties": {
      "name": { "type": "string" },
      "size": {
        "type": "string",
        "enum": ["small", "medium", "large"]
      },
      "crust": { "type": "string" },
      "cheese": { "type": "string" },
      "toppings": {
        "type": "array",
        "items": { "type": "string" }
      }
    },
    "required": ["name", "size", "crust", "cheese", "toppings"]
  }
}'

payload_file=$(mktemp)
header_file=$(mktemp)
body_file=$(mktemp)
cleanup() {
  rm -f "$payload_file" "$header_file" "$body_file"
}
trap cleanup EXIT

echo "$schema_payload" | jq -c \
  --arg prompt "make a delicious spicy pizza that respects this schema" \
  --arg sys "$SYSTEM_PROMPT" \
  --arg user "$OBJ_USER" \
  --arg title "$OBJ_TITLE" \
  '. + {prompt: $prompt, system: $sys, user: $user, title: $title}' > "$payload_file"

request_url="${OBJ_BASE_URL%/}/obj/${OBJ_TYPE}"

echo "POST ${request_url}"
cat "$payload_file" | jq .

if ! curl -sS -D "$header_file" -o "$body_file" -X POST \
  -H 'Content-Type: application/json' \
  --data @"$payload_file" \
  "$request_url"; then
  echo "curl command failed" >&2
fi

echo
echo "--- Response headers ---"
sed -n '1,120p' "$header_file"

echo
echo "--- Response body ---"
sed -n '1,200p' "$body_file"
