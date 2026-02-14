# QA: Deliberation Rounds UX Validation

This document defines the expected UX for **first round** vs **subsequent rounds** (2nd, 3rd, etc.) of council deliberation. Use it to validate the flow is correct.

---

## First Round (Initial Deliberation)

### Step 1: Prompt Engineering
- [ ] **Header:** "Step 1: Prompt Engineering" (no "Refinement Round" suffix)
- [ ] **Description:** "Describe what you're trying to achieve. I'll help you refine it into a clear, logical prompt."
- [ ] **Visible:** Chat input box with "Describe what you're trying to achieve..."
- [ ] **Visible:** Send button, Suggest Final Prompt button (after first message)
- [ ] **NOT visible:** "Your prior prompt — edit for this round" section
- [ ] **NOT visible:** "Previous council synthesis (for reference)" collapsible
- [ ] **After finalizing:** Shows "✓ Step 1 Complete: Finalized Prompt" with read-only prompt
- [ ] **Fixed bar:** "→ Continue to Step 2" button at bottom

### Step 2: Context Engineering
- [ ] **Header:** "Step 2: Context Engineering - Add Intelligence with RAG" (no "Refinement Round")
- [ ] **Description:** "Upload documents, presentations, and research materials..."
- [ ] **NOT visible:** "Prior context — edit for this round" section
- [ ] **NOT visible:** "Refinement round:" banner
- [ ] **Visible:** Manual context textarea, upload zone, Add Link, Paste Text
- [ ] **Visible:** Package button bar ("→ Review & Package")
- [ ] **After packaging:** Shows "✓ Step 2 Complete: Context Packaged" and "→ Continue to Review & Step 3"

### Step 3: Council Deliberation
- [ ] Runs council, shows Stage 1/2/3 results
- [ ] **Visible:** "Start new round of deliberation" button after completion

---

## Subsequent Rounds (2nd, 3rd, etc. — Refinement)

User clicks **"Start new round of deliberation"** from Council view.

### Step 1: Prompt Engineering (Refinement)
- [ ] **Header:** "Step 1: Prompt Engineering (Refinement Round)"
- [ ] **Description:** "This is a refinement round. Edit your prompt below, then continue to Step 2."
- [ ] **Visible:** "Your prior prompt — edit for this round" with pre-filled editable textarea
- [ ] **Visible (optional):** "Previous council synthesis (for reference)" collapsible
- [ ] **NOT visible:** Empty chat input box ("Describe what you're trying to achieve...")
- [ ] **NOT visible:** Send button, Suggest Final Prompt
- [ ] **Fixed bar:** "Edit your prompt above" + "→ Continue to Step 2" at bottom
- [ ] User can edit prompt in textarea and click Continue to save and proceed

### Step 2: Context Engineering (Refinement)
- [ ] **Header:** "Step 2: Context Engineering (Refinement Round) - Add Intelligence with RAG"
- [ ] **Description:** "This is a refinement round. Edit your prior context below, add more documents, or proceed to package."
- [ ] **Visible:** "Prior context — edit for this round" section at top (prior packaged context)
- [ ] **Visible:** "Edit context" button to edit prior packaged context
- [ ] **Visible:** "Refinement round:" banner ("Prior context is loaded. Add additional documents...")
- [ ] **Visible:** Manual context area (pre-loaded from prior user messages)
- [ ] **Visible:** Upload zone, Add Link, Paste Text (to add more)
- [ ] **Visible:** Documents/files/links from prior round
- [ ] **Visible:** Package bar with "Refinement round:" and "→ Update & Package"
- [ ] **NOT visible:** "✓ Step 2 Complete: Context Packaged" read-only block (that's first-round only)
- [ ] User can edit prior context, add documents, then click "Update & Package" to proceed

### Step 3: Review & Council
- [ ] Same as first round — review, then run council

---

## Clear Differences Summary

| Element | First Round | Subsequent Rounds |
|--------|-------------|-------------------|
| Step 1 header | "Prompt Engineering" | "Prompt Engineering (Refinement Round)" |
| Step 1 input | Chat box for new prompt | Editable prior prompt textarea only |
| Step 1 empty box | Visible (chat input) | **NOT visible** |
| Step 2 header | "Context Engineering" | "Context Engineering (Refinement Round)" |
| Step 2 prior context | Not shown | "Prior context — edit for this round" at top |
| Step 2 refinement banner | Not shown | "Refinement round: Prior context is loaded..." |
| Step 2 completion block | "✓ Step 2 Complete" shown | **NOT shown** (always editable) |
| Step 2 package bar | "Review & Package" | "Update & Package" |
| Manual context | Empty | Pre-loaded from prior round |

---

## Validation Checklist

1. **First round:** Complete Step 1 (chat, finalize), Step 2 (add context, package), run council
2. **Second round:** Click "Start new round" → verify Step 1 has NO empty input box, only prior prompt
3. **Second round:** Verify Step 2 shows prior context section, refinement banner, and package bar
4. **Third round:** Same as second round (refinement UX applies to all rounds after first)
