# QA: Deliberation Rounds UX Validation

This document defines the expected UX for **first round** vs **subsequent rounds** (2nd, 3rd, etc.) of council deliberation. The design principle: **Step 1 and Step 2 behave the same in every round**. The only difference in later rounds is that prior content is preserved and pre-loaded so users can continue from where they left off.

---

## Design Principle: Same Behavior Everywhere

- **Same headers** for Step 1 and Step 2 in all rounds
- **Same descriptions** for all rounds
- **Same layout**: chat input / manual context / upload zone / package bar
- **Same actions**: Send, Suggest Final, Finalize, Review & Package, Continue
- **Only difference**: In rounds 2+, prior prompt, prior context, and prior documents are pre-filled so the user can build on them without starting over

---

## Step 1: Prompt Engineering (All Rounds)

- [ ] **Header:** "Step 1: Prompt Engineering" (same in all rounds)
- [ ] **Description (before finalizing):** "Describe what you're trying to achieve. I'll help you refine it into a clear, logical prompt."
- [ ] **Description (after finalizing):** "Your prompt is ready. Edit if needed, then continue to Step 2."
- [ ] **Visible:** Chat input box with Send, Suggest Final Prompt (same for all rounds)
- [ ] **After finalizing:** "✓ Step 1 Complete: Finalized Prompt" with "Edit prompt" button and "→ Continue to Step 2"
- [ ] **Refinement rounds (2+):** Prior prompt is preserved; "Previous council synthesis (for reference)" collapsible is available. Same layout, same Edit/Continue flow.

---

## Step 2: Context Engineering (All Rounds)

- [ ] **Header:** "Step 2: Context Engineering - Add Intelligence with RAG" (same in all rounds)
- [ ] **Description:** "Upload documents, presentations, and research materials that will be intelligently analyzed and used to enhance your council's responses..."
- [ ] **Visible:** Manual context textarea, upload zone, Add Link, Paste Text
- [ ] **Visible:** Package bar ("→ Review & Package") when context not yet packaged
- [ ] **After packaging:** "✓ Step 2 Complete: Context Packaged" with "Edit & Re-package" and "→ Continue to Review & Step 3"
- [ ] **Refinement rounds (2+):** Prior manual context pre-loaded; prior documents/files/links preserved; "View/Edit Packaged Context" collapsible when prior packaged context exists. Same layout, same Review & Package flow.

---

## Step 3: Council Deliberation

- [ ] Same for all rounds — review, then run council
- [ ] **Visible:** "Start new round of deliberation" button after completion

---

## What Changes in Later Rounds (Content Only)

| Element | First Round | Subsequent Rounds |
|--------|-------------|-------------------|
| Step 1 prompt | Empty, user types new | Pre-filled from prior round |
| Step 1 reference | None | "Previous council synthesis" collapsible available |
| Step 2 manual context | Empty | Pre-loaded from prior user messages |
| Step 2 documents/files/links | Empty | Preserved from prior round |
| Step 2 packaged context | None until packaged | "View/Edit Packaged Context" collapsible when prior packaged context exists |

**What does NOT change:** Headers, descriptions, layout, buttons, package bar label ("Review & Package"), completion state ("✓ Step 2 Complete"), or transition actions.

---

## Validation Checklist

1. **First round:** Complete Step 1 (chat, finalize), Step 2 (add context, package), run council
2. **Second round:** Click "Start new round" → verify Step 1 has same layout; prior prompt pre-filled; "Edit prompt" opens same finalize form
3. **Second round:** Verify Step 2 has same layout; prior manual context and documents pre-loaded; same "Review & Package" bar
4. **Third round:** Same as second round — consistent UX, content builds on prior
