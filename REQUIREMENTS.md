# LLM Council — Product Requirements

*For AI coding agents: read this document when making changes to workflow, handoffs, preparation, or council logic.*

## 1. Product Vision

LLM Council helps users refine prompts through dialogue, then receive multi-LLM deliberation with anonymized peer review. The system has two main phases:

- **Prepare for Deliberation**: Chat with an assistant to refine the prompt, add attachments (documents, files, links), and package context for RAG. The assistant asks probing questions and suggests when attachments would help.
- **Council Deliberation**: Multiple LLMs respond in parallel, evaluate each other anonymously, and a chairman synthesizes a final answer.

Users iterate across rounds until satisfied. Knowledge from prior rounds must carry forward so that each round builds on the last—better prompts, sharper questions, and deeper deliberation.

## 2. Handoff Specifications

Define the three critical transitions with exact behavior.

### Transition 1: Prepare → Council (Submit to Council)

- Single button, one click, straight to deliberation.
- Finalizes prompt if needed, packages context, starts council—no intermediate confirmations.
- "Suggest Final Prompt" is an optional helper that populates the main input (not a separate form).
- No "Finalize & Continue" or "Finalize edited prompt" buttons—Submit to Council does everything.
- Submit to Council should only appear when the user has meaningful content (at least one message exchanged OR input text present).

### Transition 2: Council → Next Round Prepare (Start New Round)

- Creates a new conversation linked to the prior round.
- **Carries forward**: finalized prompt (pre-filled, editable), context/attachments (preserved), prior council synthesis (`prior_synthesis`), and a summary of the preparation conversation from the prior round (`prior_preparation_summary`).
- **Resets**: council deliberation messages (fresh slate for the new round).
- The preparation assistant receives both `prior_synthesis` AND `prior_preparation_summary` so it knows what was already discussed.

### Transition 3: Within Preparation (Chat → Ready to Submit)

- The preparation assistant asks probing questions and helps refine the prompt.
- When the assistant believes the prompt is ready, it should say so clearly and suggest submitting to council.
- The user can submit at any time—the assistant does not gate the flow.

## 3. Multi-Round Knowledge Retention

Specific data that MUST persist across rounds:

| Data | Purpose |
|------|---------|
| `prior_synthesis` | The council's final answer from the previous round. Passed to preparation and council so both can avoid repetition and push deeper. |
| `prior_preparation_summary` | Summary of the preparation conversation (what questions were asked, what was clarified, what the user decided). Prevents the assistant from re-asking resolved questions. |
| `finalized_prompt` | Pre-filled so the user can edit, not start over. |
| `context_engineering` | Documents, files, links preserved. |
| `finalized_context` | The packaged context preserved. |

The preparation assistant system prompt (in `backend/preparation.py`) must reference both the prior synthesis AND the prior preparation summary.

## 4. Quality of Questions (Critical Thinking Aid)

- **Preparation assistant role**: Ask probing, targeted questions that clarify goals, scope, edge cases, and constraints. Do not assume—uncover hidden requirements.
- **Round 1**: Focus on understanding goals, scope, constraints, and desired output format.
- **Round 2+**: Reference the prior synthesis to identify gaps. Reference the prior preparation summary to avoid re-asking resolved questions. Push on what is still unclear or unexplored.
- **Progressive improvement**: Each round should help the user formulate a better prompt and a sharper question. The goal is satisfaction through iteration, not a single-shot answer.
- **Adaptive strategy**: The assistant should adapt its question strategy based on what has already been covered.
- **Preserve and strengthen**: Any changes to `preparation.py` or council prompts should preserve or strengthen this critical-thinking, question-quality focus.

## 5. Code Quality Standards

- **Remove dead code paths**: Unused stage cases in `renderStage()`, unused components.
- **Consolidate duplicated logic**: Prior synthesis extraction should happen in ONE place (e.g., a utility or helper function).
- **Remove excessive debug logging**: Dozens of `console.log` calls in production code are not acceptable. Keep error logs only.
- **Use CSS classes**: No inline styles for error states—use existing or new CSS classes.
- **Keep components focused**: If App.jsx render blocks exceed complexity, extract into separate components.

## 6. Implementation Checklist for Agents

When making changes, verify:

- [ ] Submit to Council does not open extra forms or confirmations.
- [ ] "Start new round" carries forward: prompt, context, attachments, `prior_synthesis`, `prior_preparation_summary`.
- [ ] `preparation.py` system prompt uses both `prior_synthesis` and `prior_preparation_summary`.
- [ ] No dead code paths remain in the `renderStage` switch.
- [ ] Prior synthesis extraction is consolidated to one utility function.
- [ ] UI flows have no extra confirmation steps; Submit to Council leads directly to deliberation.
- [ ] Preparation assistant prioritizes question quality, probing, and progressive refinement over generic replies.
