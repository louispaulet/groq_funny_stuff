# Root Cause Analysis: Missing Saved Conversations and Images

## Summary
- Chat conversations were stored in a single cookie with aggressive limits (two conversations and six messages each). Once the cap was hit, subsequent chats replaced older ones and message bodies were truncated, leading to missing and cropped history in the UI.
- Generated image metadata was constrained to 60 entries in a single cookie. When the gallery reached that limit, newer renders were dropped instead of being appended, making the gallery appear "full".
- Both features relied on singular cookies capped around 3.5 KB. Larger histories silently failed to persist because the payload exceeded the cookie size, so nothing beyond the truncated data was retrievable.

## Fixes
- Added a shared chunked cookie helper that transparently splits large JSON payloads across sequential cookies and rejoins them when reading. Legacy single-cookie data is still readable.
- Updated conversation persistence to remove artificial caps, retain every message, and rely on the chunked cookies for storage. Ordering now mirrors the in-memory conversation list.
- Updated image history persistence to reuse the chunked helper, removing the gallery cap so every saved render is recoverable in order.
- Expanded the automated tests to cover the unbounded history behaviour and ensure chunked cookies are created and cleared correctly.
