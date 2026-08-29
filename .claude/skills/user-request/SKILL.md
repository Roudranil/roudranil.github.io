---
name: user-request
description: this skill details instructions that you must follow when the user comes with a feature request or a request to fix a bug or to do any non trivial change in this codebase
---

# What are you supposed to do?

- Orient yourself. Follow CLAUDE.md. Read docs.
- Launch highly scoped, specialised and targeted explore subagents to explore necessary parths of the codebase. You need to keep your context free. If needed, use both `Explore` and `Plan` subagents.
- With detailed research present a plan on how you to tackle the request.
- Once plan is approved, make the changes.
- After making code/doc/whatever changes, STOP. DONT COMMIT.
- Ask the user to run `npm run dev` or something to be sure things look okay. They will provide feedback. You may need to go back and change things based on that feedback. Let this loop continue.
- Once all feedback is accounted for and user EXPLICITLY signs off, commit the changes.
- Update docs, add new docs files as the case may be.

## Any specific rules you must follow?

Yes absolutely. The harness will inject global and file specific rules into your context as and when required. Follow them to the T.

BEST OF LUCK.