# TODO
- [x] Audit existing cookie storage for conversations and image galleries to identify truncation and missing data causes.
- [x] Introduce a shared chunked cookie utility for storing large JSON payloads.
- [x] Update conversation persistence to store full histories without cropping and maintain order.
- [x] Update image gallery persistence to store all saved images using the shared utility.
- [x] Add or update unit tests covering the new cookie storage behaviour for chats and images.
- [x] Run the relevant test suites to confirm everything passes.
- [x] Document the root causes and fixes in a report.
