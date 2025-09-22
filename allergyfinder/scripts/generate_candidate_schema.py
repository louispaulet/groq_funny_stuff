#!/usr/bin/env python3
import json
import sys
from pathlib import Path

THIRD_PARTY = Path(__file__).resolve().parents[2] / 'third_party' / 'pydantic-1.10.18'
if THIRD_PARTY.exists():
    sys.path.insert(0, str(THIRD_PARTY))

try:
    from pydantic import BaseModel, Field
except Exception as exc:  # pragma: no cover
    sys.stderr.write(f"Failed to import pydantic: {exc}\n")
    sys.exit(1)


class CandidateTerms(BaseModel):
    terms: list[str] = Field(..., min_items=1, max_items=6)

    class Config:
        extra = 'forbid'


def main() -> None:
    schema = CandidateTerms.schema()
    base_path = Path(__file__).resolve().parents[1] / 'src' / 'lib'
    json_path = base_path / 'offCandidateSchema.json'
    js_path = base_path / 'offCandidateSchema.js'
    json_path.write_text(json.dumps(schema, indent=2), encoding='utf-8')
    js_path.write_text(f"export default {json.dumps(schema, indent=2)};\n", encoding='utf-8')
    print(json_path)
    print(js_path)


if __name__ == '__main__':
    main()
