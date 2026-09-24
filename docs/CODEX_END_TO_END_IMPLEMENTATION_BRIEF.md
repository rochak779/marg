# End-to-End Implementation Brief: AI Learning Product for Product Managers

> This file is both the implementation contract and the curriculum source of truth for the MVP. Read it completely before changing code.

## 1. Your role

Act as the senior product engineer responsible for connecting the existing assessment, home, courses, progress and current labs/build screens into one coherent, working learning journey.

Do not rebuild the application from scratch. Inspect the repository, understand the current stack and reuse the existing design system, routes, components, state management and persistence approach wherever they are sound.

## 2. Mandatory working method

- Read every applicable `AGENTS.md`, README, package manifest and environment example before editing.
- Inspect the current repository structure, routes, existing assessment logic, home screen, courses screen, progress screen and labs/build screen.
- Run the application and capture the current baseline. Do not assume the framework, database, authentication provider or test runner.
- Check `git status` before editing. Preserve all unrelated user changes.
- Create a short implementation plan mapped to the milestones in this file before coding.
- Reuse the current visual language. Do not replace the existing interface with a generic dashboard or a new component library.
- Implement in small vertical slices. After each slice, run the relevant tests, type checks and lint checks.
- If the repository is Git-backed and commits are safe, create one focused commit after each completed milestone. Never commit unrelated changes.
- If a requirement conflicts with the existing architecture, explain the conflict and choose the smallest compatible implementation. Stop only when a product decision or credential is genuinely required.
- Do not add a live OpenAI, Anthropic or other LLM API integration in this MVP. The learning experience teaches users how to work in ChatGPT or Claude; course content and progress are handled inside this product.

## 3. Product outcome

A new learner must be able to:

- Complete a three-question assessment.
- Receive the correct basic or advanced learning path with an explainable recommendation.
- Open the home screen and see the next useful action.
- Browse only the modules included in their path, in the correct order.
- Complete Monday-Friday theory and a three-question check each day.
- Complete a guided Saturday build using ChatGPT or Claude.
- Complete a Sunday independent adaptation.
- Leave, return and resume from the same point.
- See accurate course and progress information derived from real completion data rather than mock statistics.

## 4. Non-goals

- No generic workflow canvas.
- No production RAG system, vector database or agent orchestration.
- No in-product execution of the learner's AI workflow.
- No live AI-generated curriculum.
- No instructor dashboard, social leaderboard, cohort management or payment flow.
- No forced real-calendar gating. The labels Monday-Sunday communicate the learning rhythm, but users may continue sequentially during MVP testing.
- No upload of confidential workplace data. All supplied exercises use mock data; personal practice must show a privacy warning.
- No lesson audio/narration for now. Tried on 2026-08-23: ElevenLabs ran out of credits; local open-source Chatterbox TTS (CPU) was evaluated as a free alternative and produced audio for all 30 lessons, but the run was scrapped — quality wasn't aligned with the lesson text — and fully reverted (manifest, generated mp3s, generation scripts, scratch venv all removed). `scripts/generate-lesson-audio.mjs` (ElevenLabs) and the `public/audio/lessons/` manifest pattern from Module 1's original 5 files still exist as the intended plumbing if audio is picked back up later, but it's explicitly out of scope until then.

## 5. Existing product and visual constraints

The assessment screens, home screen, course screen, progress screen and labs/build screens already exist. Treat the current implementation as the visual source of truth. The supplied references show a mobile-first education product with:

- Warm cream page background and large white rounded mobile surface.
- Orange and periwinkle/lavender accent cards.
- Dark charcoal navigation and high-contrast primary actions.
- Large rounded cards, playful illustrations, compact statistics and generous spacing.
- A bottom navigation pattern linking Home, Courses, Progress and other existing destinations.
- Bold, friendly headings and simple copy suitable for short mobile sessions.

Implementation rules:

- Do not copy placeholder labels such as Olympiads, Literature, Math, 78 lessons, 43 hours or Jacob into production data.
- Replace all mock totals with values computed from the learner's assigned path and completion state.
- Do not use the word “Labs” in the new learner-facing curriculum. Reuse existing lab components if helpful, but relabel the experience as **Build** for Saturday and **Practice** for Sunday.
- Maintain responsive behaviour. Mobile is primary; desktop must remain usable and should not render as an excessively stretched phone.
- Preserve accessible contrast, keyboard focus, semantic headings, labelled controls and minimum touch targets.

## 6. Assessment

Use exactly three assessment questions. Store both the raw answers and the derived path configuration.

### Question 1: entry level

**Do you currently use AI for tasks beyond writing, summarising, brainstorming or generating drafts?**

Examples shown as helper text: analysing information, categorising inputs, working across multiple sources, creating prototypes or completing a multi-step task.

- Yes
- No

Routing:

- `No` -> `basic` path. Module 1 is prepended to the applied modules.
- `Yes` -> `advanced` path. Module 1 is skipped.

### Question 2: first applied context

**Which type of work do you do most often?**

- Analyse customer feedback or conduct research -> `feedback` -> Module 2 first
- Organise feature requests, tickets or ideas -> `requests` -> Module 3 first
- Create product documents and stakeholder updates -> `communication` -> Module 4 first
- Turn product ideas into prototypes -> `prototyping` -> Module 5 first

### Question 3: build experience

**Have you ever tried to create a multi-step AI workflow?**

Examples shown as helper text: taking an input, asking AI to process it, producing a structured output and passing that result into another step or tool.

- Yes -> `reduced` build guidance
- No -> `full` build guidance

Question 3 must not change the course modules. It changes instructional scaffolding on Saturday: helper text, expanded explanations, default-open hints and checklist detail. Both modes must preserve the same goal and completion criteria.

### Valid applied-module rotations

| Selected context | Applied sequence |
|---|---|
| `feedback` | 2 -> 3 -> 4 -> 5 |
| `requests` | 3 -> 4 -> 5 -> 2 |
| `communication` | 4 -> 5 -> 2 -> 3 |
| `prototyping` | 5 -> 2 -> 3 -> 4 |

Final sequence algorithm:

```ts
const APPLIED_ROTATIONS = {
  feedback: [2, 3, 4, 5],
  requests: [3, 4, 5, 2],
  communication: [4, 5, 2, 3],
  prototyping: [5, 2, 3, 4],
} as const;

const assignedModuleIds = entryLevel === 'basic'
  ? [1, ...APPLIED_ROTATIONS[selectedContext]]
  : [...APPLIED_ROTATIONS[selectedContext]];
```

Examples:

- Q1 No + Q2 Feedback + Q3 No -> Basic, full guidance, modules `1,2,3,4,5`.
- Q1 Yes + Q2 Documents + Q3 Yes -> Advanced, reduced guidance, modules `4,5,2,3`.
- Q1 No + Q2 Prototypes + Q3 Yes -> Basic, reduced guidance, modules `1,5,2,3,4`. This combination is allowed; the learner has tried automation but self-reports only basic AI usage.

### Recommendation screen

After submission, show:

- Path label: Basic foundations or Advanced applied path.
- First module title.
- Short explanation tied to Q1 and Q2.
- Full ordered module path.
- Build guidance level in plain language, not an internal label.
- Primary CTA: Start first lesson.
- Secondary action: Retake assessment.

Do not describe the recommendation as AI-generated. It is deterministic routing based on three answers.

## 7. Information architecture and routes

Adapt paths to the repository's routing convention. Do not introduce a second router.

| Destination | Required behaviour |
|---|---|
| Assessment | Three questions, validation, back/next controls, saved answers |
| Recommendation | Explain path and start point |
| Home | Continue card, weekly position, real progress summary, next action |
| Courses | Assigned modules only, ordered by personalised sequence |
| Module overview | Seven day cards, progress, estimated time and outcome |
| Weekday lesson | Hook, theory, example, action, saved component and quiz |
| Quiz result | Score, answer explanations, retry and continue |
| Saturday Build | Tool choice, privacy notice, mock input, steps, copyable prompt, checklist |
| Sunday Practice | Independent task, rules, reflection and self-check |
| Progress | Accurate module/day completion, minutes and current streak if implemented |

The learner must be able to navigate backward to completed material. The next incomplete item is the default continuation target.

## 8. Learning and progression rules

- Every module contains seven learning units: Monday-Friday lessons, Saturday Build and Sunday Practice.
- Monday is available when a module becomes current.
- Submitting a weekday quiz marks that day complete and unlocks the next day.
- A score of 2/3 is shown as “Complete”. A lower score is shown as “Review recommended”, but the learner is not trapped; allow retry or continue.
- Quiz answers and explanations remain hidden until all three answers are submitted.
- Saturday unlocks after all five weekday quizzes have been submitted.
- Saturday completes only after the learner checks every completion item and confirms that they ran the exercise in ChatGPT or Claude.
- Sunday unlocks after Saturday completes.
- Sunday completes after required self-checks and at least one short reflection response.
- The next module unlocks after Sunday completes.
- No actual weekday/date check is used in the MVP. “Monday” through “Sunday” are sequence labels.
- Retaking the assessment requires a confirmation explaining that the assigned order will change. Preserve completed units by module/day ID wherever possible.

## 9. Saturday Build experience

Saturday is a guided handoff into ChatGPT or Claude, not an in-product AI execution environment.

Required UI:

- A clear outcome and estimated time.
- Tool selector: ChatGPT or Claude. The underlying instructions remain platform-neutral unless a genuine platform difference exists.
- Privacy notice before any prompt or input: use mock or anonymised data and follow organisational policy.
- Expandable practice input.
- Numbered steps with persistent checkboxes.
- Copy prompt button with copied state and accessible feedback.
- Optional Open ChatGPT and Open Claude links in a new tab. Do not imply that the product can observe activity in those tools.
- Completion checklist.
- A learner confirmation: “I ran the workflow and checked the result.”
- Full-guidance mode expands explanations and hints. Reduced-guidance mode collapses hints by default but keeps them available.

Never claim that the learner built production automation merely by using a prompt. Use the curriculum wording exactly where it distinguishes a manual workflow, source-grounded exercise, simulation or prototype from a deployed system.

## 10. Sunday Practice experience

- Show the independent challenge before hints.
- Require the learner to change at least one input, rule, output field or test case.
- Provide optional hints one at a time.
- Collect short reflection answers locally or through the existing persistence layer.
- Do not automatically grade open-ended work in the MVP.
- Use a self-check rubric tied to the module completion criteria.
- Clearly state that using a hint is acceptable; copying the unchanged Saturday prompt is not independent practice.

## 11. Home, Courses and Progress behaviour

### Home

- Primary card shows the current module, current day and one CTA: Continue.
- If nothing has started, CTA is Start your path.
- If the current unit is Saturday, call it Build; if Sunday, call it Practice.
- Progress percentage = completed assigned units / total assigned units.
- Show completed lessons and estimated learning minutes, not fake “hours”.
- If the current design contains a hero illustration, retain it but connect its copy to the current learning outcome.

### Courses

- Show only the learner's assigned modules in personalised order.
- Each card shows sequence position, title, capability outcome, 7 units, progress and state: Current, Upcoming or Complete.
- Do not display school-subject labels or social avatars unless they already represent real product functionality.
- Advanced learners must never see Module 1 as a required locked course.

### Progress

- Replace sample lesson and hour counts with derived data.
- Show completion by module and by day type.
- Use estimated minutes: weekday 10, Saturday use curriculum estimate midpoint, Sunday 15 unless an existing timer provides real elapsed time.
- If retaining a chart, plot real completed units. Empty states should explain what will appear after the first completion.
- Optional lightweight gamification: 10 XP weekday, 30 XP Saturday, 20 XP Sunday and 5 bonus XP for a perfect first-attempt quiz. Do not block completion on XP and do not add a leaderboard.

## 12. Data architecture

Store curriculum separately from UI components. Prefer typed TypeScript data if the project uses TypeScript; otherwise use the project's native language and conventions. JSON is acceptable if runtime validation is added.

Suggested entities:

```ts
type EntryLevel = 'basic' | 'advanced';
type WorkContext = 'feedback' | 'requests' | 'communication' | 'prototyping';
type GuidanceLevel = 'full' | 'reduced';
type DayKind = 'weekday' | 'build' | 'practice';

interface AssessmentResult {
  entryLevel: EntryLevel;
  selectedContext: WorkContext;
  guidanceLevel: GuidanceLevel;
  rawAnswers: { q1: boolean; q2: WorkContext; q3: boolean };
  assignedModuleIds: number[];
  completedAt: string;
}

interface ModuleContent {
  id: number;
  slug: string;
  title: string;
  audience: string;
  promise: string;
  weekdayBuild: string[];
  days: LearningDay[];
  saturday: BuildDay;
  sunday: PracticeDay;
}

interface LearningDay {
  id: string;
  label: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  title: string;
  hook: string;
  theory: string[];
  example: string;
  action: string;
  saveForSaturday: string;
  quiz: QuizQuestion[];
  estimatedMinutes: number;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

interface LearnerProgress {
  assessment: AssessmentResult | null;
  completedUnitIds: string[];
  quizAttempts: Record<string, { score: number; answers: number[]; attemptedAt: string }[]>;
  buildChecks: Record<string, string[]>;
  practiceReflections: Record<string, string[]>;
  lastVisitedUnitId: string | null;
  xp: number;
  updatedAt: string;
}
```

Persistence decision:

- If the repository already has authentication and a database, extend the existing user/profile and progress model using its established migration pattern.
- If no backend exists, create a small persistence interface and implement it with versioned `localStorage` for the MVP. Do not introduce Supabase, Firebase or another backend without an explicit product decision.
- Keep routing logic as pure functions with unit tests.
- Use stable IDs such as `module-2-wednesday`, `module-3-build` and `module-5-practice`; do not use array indexes as persistence identifiers.
- Include a schema/content version so future curriculum edits can be migrated safely.
- Validate stored data and recover gracefully from corrupt or outdated local state.

## 13. Content rendering requirements

- Do not hardcode curriculum prose inside page components.
- Render all weekday lessons from the content model.
- Render all quiz choices from data and store the correct answer by index or stable option ID.
- Do not reveal answers in page source through a visibly rendered answer block before submission. Client-side content is not secure; this is an interaction requirement, not an anti-cheating security guarantee.
- Preserve paragraph breaks in theory content and line breaks in prompt/sample blocks.
- Use a monospace or clearly differentiated style for prompts and mock data, with a copy button.
- Long content must remain readable on a phone: short sections, sticky or obvious Continue action, clear progress and no horizontal scrolling.
- Add previous/next navigation and restore scroll to top when changing lessons.

## 14. Analytics events

Use the existing analytics wrapper if one exists. If none exists, add a typed no-op event interface rather than installing a vendor.

Track:

- `assessment_started`
- `assessment_answered`
- `assessment_completed`
- `path_recommended`
- `lesson_started`
- `lesson_completed`
- `quiz_submitted`
- `quiz_retried`
- `build_started`
- `prompt_copied`
- `build_completed`
- `practice_started`
- `hint_opened`
- `practice_completed`
- `module_completed`

Properties should include stable module/unit IDs, entry level, selected context and guidance level. Never send lesson free text, learner reflections or pasted work data to analytics.

## 15. Loading, empty and error states

- No assessment: route to assessment with a clear explanation.
- Assessment saved but path missing: recompute deterministically.
- No progress: show Start rather than 0/0 or fake charts.
- Corrupt stored progress: preserve the assessment if valid, reset only invalid progress and show a non-technical message.
- Unavailable route or module not assigned: redirect to the next assigned unit, not a blank page.
- Copy-to-clipboard failure: select the prompt and show manual-copy guidance.
- External ChatGPT/Claude link blocked: the prompt remains copyable and the build remains usable.

## 16. Test plan

Use the repository's existing testing tools. Add the smallest missing test setup only if necessary.

### Unit tests

- All 16 assessment combinations produce the expected entry level, context, guidance and module sequence.
- Basic paths always include Module 1 once; advanced paths never include it.
- Each applied rotation contains Modules 2-5 exactly once.
- Progress percentage uses assigned units only.
- Next-unit logic works at weekday, Saturday, Sunday and module boundaries.
- Retaking the assessment preserves completion by stable unit ID.
- Quiz scoring and explanations match the content data.
- Stored-state validation handles missing and invalid fields.

### End-to-end tests

- New basic learner selecting Feedback and no workflow experience: assessment -> recommendation -> Module 1 Monday -> quiz -> resume after refresh.
- New advanced learner selecting Documents and workflow experience: assessment -> recommendation -> Module 4 Monday; Module 1 absent.
- Complete five weekday lessons -> Saturday unlocks.
- Complete Saturday checks -> Sunday unlocks.
- Complete Sunday -> next personalised module becomes current.
- Courses screen uses personalised order and accurate card states.
- Home Continue CTA always opens the next incomplete unit.
- Progress screen matches actual completed-unit count and estimated minutes.
- Quiz answers are hidden before submit and explanations appear after submit.
- Prompt copy control works and has accessible confirmation.
- App works at 375px mobile width and a common desktop viewport without overflow or broken navigation.

### Content validation tests

- Exactly 5 modules.
- Exactly 5 weekday lessons per module.
- Exactly 3 quiz questions per weekday.
- Every quiz has four options, one valid answer and an explanation.
- Every module has one Saturday Build and one Sunday Practice.
- Every Saturday has a prompt, practice input, at least 7 steps and completion criteria.
- Every learner-facing module ID and day ID is unique.
- No content still uses the discarded “Lab” terminology.

## 17. Implementation milestones

### Milestone 0: repository audit

- Document the actual stack, routes, state, persistence, test commands and reusable components.
- Run the current app and tests.
- Record gaps and the proposed file-level plan before editing.

### Milestone 1: curriculum and routing foundation

- Create typed content models and seed all five modules.
- Implement pure assessment-routing functions.
- Add schema/content validation and tests.

### Milestone 2: assessment to recommendation

- Connect existing questions to saved assessment state.
- Implement deterministic path generation.
- Build the recommendation summary and retake behaviour.

### Milestone 3: courses and daily lesson flow

- Render personalised course cards.
- Implement module overview, weekday lesson and quiz states.
- Persist quiz attempts and unlock progression.

### Milestone 4: Saturday and Sunday

- Convert/reuse existing lab UI as Build and Practice components.
- Add privacy notice, prompt copy, tool links, step checks, guidance variants and reflection state.
- Implement unlock and completion logic.

### Milestone 5: home and progress

- Replace mock dashboard values with computed state.
- Connect Continue CTA.
- Implement accurate progress and empty states.

### Milestone 6: verification and polish

- Run unit, integration and end-to-end tests.
- Run lint, formatting, type checks and production build.
- Review mobile and desktop layouts against the existing visual system.
- Review the final diff for regressions, placeholder copy and inaccessible interactions.

## 18. Definition of done

- The application builds and runs using the repository's documented commands.
- Assessment routing works for all 16 answer combinations.
- Basic and advanced learners receive the correct module counts and sequences.
- All 25 weekday lessons and 75 quiz questions render from structured content.
- All five Saturday Builds and five Sunday Practices are reachable and persist completion.
- Home, Courses and Progress contain no hardcoded demo statistics.
- Refresh and return journeys preserve the learner's state.
- No production AI capability is falsely implied.
- No sensitive learner input is logged or sent to analytics.
- Automated checks pass and the critical flows have been visually tested on mobile and desktop.
- The final handoff includes: files changed, architecture decisions, migrations, commands run, test results, known limitations and the next safest iteration.

## 19. Start instruction for Codex

Begin by inspecting the repository. Do not write code until you have identified the current architecture and mapped existing screens/components to this brief. Then present a milestone plan with the exact files likely to change. After the plan is clear, implement the milestones in order and verify each one before continuing. Do not redesign completed screens unless a functional requirement makes a targeted change necessary.

---

# Appendix A: Full Curriculum Content

This appendix is the learner-content source of truth. Convert it into the project's structured data format. Preserve meaning and safety caveats. Small punctuation or UI-length edits are allowed only when meaning is unchanged.

## Module 1: From Asking AI to Directing AI

**Audience:** Basic learners only

**End-of-week capability:** By Day 7, the learner can turn messy meeting notes into a clear, reusable set of actions using ChatGPT or Claude, and can explain why the output still needs human review.

**Weekday build components:**

- Day 1: AI capability map
- Day 2: Prompt goal
- Day 3: Context and constraints
- Day 4: Verification checklist
- Day 5: Reusable prompt structure

### Monday: AI is a prediction engine, not a knowledgeable colleague

**Hook:** You ask AI a confident question. It gives a confident answer. The dangerous assumption is that confidence means correctness.

#### Theory

Artificial intelligence is a broad name for computer systems that perform tasks we associate with human intelligence, such as recognising patterns, understanding language, making predictions and generating content.

Tools such as ChatGPT and Claude are powered by large language models, or LLMs. An LLM has learned patterns from very large amounts of text. When you type a message, it predicts a useful continuation one piece at a time. That is why it can explain, rewrite, classify and summarise language so fluently.

An LLM does not automatically know your company, your customers or what happened in yesterday's meeting. It only has the information available in the conversation and any material you provide. It can also produce plausible information that is incorrect. Treat it as a fast pattern assistant, not as an unquestionable source of truth.

A useful mental model is: AI proposes; you decide. Use it to accelerate thinking and repetitive language work, while keeping responsibility for facts, judgement and consequences with the human user.

**Example:** Weak expectation: 'AI knows what happened in our meeting.' Better expectation: 'If I give AI accurate meeting notes and clear instructions, it can help organise those notes.'

**Do this now:** Write down one task where AI could help you work with existing information, and one task where you would not trust it without checking.

**Keep for Saturday:** A two-column capability map: 'AI can help' and 'Human must decide'.

#### Three-question check

1. **What does an LLM mainly do when it generates a response?**
   - A. Search every website in real time
   - B. Predict a useful continuation from patterns
   - C. Recall a guaranteed fact database
   - D. Copy one complete stored answer
   - **Correct option:** B
   - **Explanation:** LLMs generate language by predicting likely and useful next pieces of text; this does not guarantee factual accuracy.
2. **Which is the safest way to think about AI at work?**
   - A. AI proposes; a human decides
   - B. AI is correct when it sounds confident
   - C. AI replaces the need for source material
   - D. AI should make every final decision
   - **Correct option:** A
   - **Explanation:** The user remains responsible for checking facts, applying judgement and considering consequences.
3. **Why might AI struggle with yesterday's internal meeting?**
   - A. It dislikes meeting notes
   - B. It cannot write summaries
   - C. It may not have the meeting information
   - D. It only works with numbers
   - **Correct option:** C
   - **Explanation:** The model needs the relevant notes or source material in the conversation before it can work reliably with them.

### Tuesday: A good prompt begins with a job, not clever wording

**Hook:** Most weak prompts are not badly written. They are missing a clear job.

#### Theory

A prompt is the instruction and information you give an AI. Good prompting is not about discovering a magical sentence. It is about making the task unambiguous.

Start by defining four things: the goal, the input, the expected output and the audience. 'Summarise this' leaves many decisions to the model. 'Turn these meeting notes into five actions for the product team' gives it a job.

Use an action verb that describes the work: classify, compare, extract, rewrite, challenge, prioritise or summarise. Then state what a successful response must contain.

Do not add unnecessary role-play such as 'You are the world's best product manager' unless a perspective genuinely changes the task. Specific information is more useful than dramatic language.

**Example:** Before: 'Summarise these notes.' After: 'From the meeting notes below, extract decisions, action items, owners and deadlines. If an owner or deadline is missing, write Not specified.'

**Do this now:** Rewrite this vague prompt: 'Help me with my meeting.' Include a goal, input and output.

**Keep for Saturday:** A one-sentence goal for Day 6: turn meeting notes into decisions and actions.

#### Three-question check

1. **Which prompt gives AI the clearest job?**
   - A. Help with this
   - B. Make this better
   - C. Extract decisions, actions, owners and deadlines from these notes
   - D. Be brilliant and analyse everything
   - **Correct option:** C
   - **Explanation:** It names the action, source and required output.
2. **What is usually more valuable than elaborate role-play?**
   - A. More emojis
   - B. Specific task information
   - C. Writing in capital letters
   - D. Calling the AI an expert
   - **Correct option:** B
   - **Explanation:** Clear context, constraints and output requirements reduce ambiguity.
3. **Which item is not part of the four-part prompt foundation taught today?**
   - A. Goal
   - B. Input
   - C. Audience
   - D. A dramatic persona
   - **Correct option:** D
   - **Explanation:** A persona can sometimes help, but goal, input, output and audience are the core foundation.

### Wednesday: Context and constraints turn a generic answer into a useful one

**Hook:** Two people can use the same AI tool and get very different value. Usually, one has supplied the missing context.

#### Theory

Context is the background the model needs to interpret the task: who the audience is, why the work matters, what has already happened and what source material it should use.

Constraints define the boundaries. Examples include: use only the notes provided, do not invent owners, keep the answer under 200 words, use plain English, or return the result as a table.

An example can show the desired pattern when words alone are ambiguous. One short example of a good action item can be more effective than a long explanation.

More context is not always better. Include what changes the answer and remove irrelevant detail. Never paste confidential, personal or commercially sensitive information into an AI tool unless your organisation has approved that use.

**Example:** Context: 'This update is for directors who were not in the meeting.' Constraint: 'Use only the notes. Mark missing information instead of guessing.'

**Do this now:** Add two constraints to yesterday's meeting prompt: one about unsupported information and one about the response format.

**Keep for Saturday:** The context and constraint section of Day 6's prompt.

#### Three-question check

1. **Which instruction is a constraint?**
   - A. The meeting was on Monday
   - B. The audience is the product team
   - C. Do not invent missing owners
   - D. These are meeting notes
   - **Correct option:** C
   - **Explanation:** It sets a boundary on what the AI is allowed to do.
2. **When should you paste confidential customer data into a public AI tool?**
   - A. Whenever it saves time
   - B. Only when organisational policy and the tool's approved use allow it
   - C. When names are interesting
   - D. Whenever the prompt says private
   - **Correct option:** B
   - **Explanation:** A prompt cannot override privacy, security or company policy.
3. **What kind of context should you include?**
   - A. Every detail you know
   - B. Only information that can change the answer
   - C. No context at all
   - D. Unrelated examples to make the prompt longer
   - **Correct option:** B
   - **Explanation:** Relevant context improves the response; irrelevant information creates noise.

### Thursday: A polished answer can still be wrong

**Hook:** AI errors are often easy to miss because they arrive in fluent sentences and tidy tables.

#### Theory

A hallucination is information generated by AI that is unsupported or incorrect but presented as if it were true. It may invent a fact, owner, deadline, quotation or source.

Verification means comparing important claims with the original source. For meeting notes, check every decision, owner and deadline. For research, open the cited source. For calculations, verify the inputs and arithmetic.

Risk determines how much checking is needed. A draft headline may need a quick review. A compliance decision, financial figure or customer commitment needs stronger evidence and often an authorised human approver.

You can reduce errors by telling AI to distinguish facts from assumptions, quote supporting text, state when information is missing and avoid filling gaps. These steps reduce risk; they do not make the model infallible.

**Example:** The AI writes 'Priya will deliver the prototype by Friday.' The notes say only 'Prototype should be explored.' The owner and deadline are hallucinated.

**Do this now:** Create a four-item checklist for reviewing an AI-generated meeting summary.

**Keep for Saturday:** A verification checklist covering decisions, owners, deadlines and unsupported claims.

#### Three-question check

1. **What is an AI hallucination?**
   - A. A colourful interface
   - B. Unsupported or incorrect information presented as true
   - C. A slow response
   - D. A spelling error made by a user
   - **Correct option:** B
   - **Explanation:** Fluent language can make fabricated or unsupported details look credible.
2. **What should you do with an important AI-generated deadline?**
   - A. Trust it if it is bold
   - B. Check it against the source
   - C. Assume Friday
   - D. Remove every deadline
   - **Correct option:** B
   - **Explanation:** Important claims should be verified against the original information.
3. **Does asking AI not to hallucinate guarantee accuracy?**
   - A. Yes, always
   - B. Only in short prompts
   - C. No; it can reduce risk but verification is still needed
   - D. Yes, if the model apologises
   - **Correct option:** C
   - **Explanation:** Instructions help, but the user must still review consequential output.

### Friday: A workflow is a repeatable path, not one lucky prompt

**Hook:** If the result depends on remembering the perfect words every Friday, you have a trick. If the process can be repeated and checked, you have the beginning of a workflow.

#### Theory

A workflow is a repeatable sequence that turns an input into an output. A simple AI workflow can include: receive notes, extract information, format the result, check missing details and review before sharing.

The workflow does not need to be automated. Reusing a saved prompt and a consistent review checklist is already more reliable than starting from scratch every time.

A useful workflow defines five elements: trigger, input, AI task, output and human review. The trigger is when the process begins. The human review step makes ownership explicit.

Save prompts as reusable templates with placeholders such as [PASTE NOTES] and [AUDIENCE]. This makes the process easier to repeat without pretending every input is identical.

**Example:** Trigger: meeting ends. Input: notes. AI task: extract decisions and actions. Output: structured table. Human review: meeting owner checks it before sharing.

**Do this now:** Write the five elements of Day 6's meeting-notes workflow.

**Keep for Saturday:** The complete workflow outline and a reusable prompt template.

#### Three-question check

1. **What makes a process a workflow?**
   - A. It uses a very long prompt
   - B. It follows a repeatable path from input to reviewed output
   - C. It runs without any human
   - D. It uses paid software
   - **Correct option:** B
   - **Explanation:** Automation is optional; repeatability and defined steps are essential.
2. **Which is a useful workflow element?**
   - A. Human review
   - B. A random writing style
   - C. An unexplained output
   - D. A hidden owner
   - **Correct option:** A
   - **Explanation:** The workflow should say who checks the result and when.
3. **Why use placeholders in a saved prompt?**
   - A. To make it look technical
   - B. To show what must change for each run
   - C. To stop the AI responding
   - D. To hide the workflow
   - **Correct option:** B
   - **Explanation:** Placeholders make a template reusable while keeping variable inputs visible.

### Saturday Build: Build your first reusable prompt workflow: meeting notes to actions

**Estimated time:** 25-30 minutes

**Outcome:** Use ChatGPT or Claude to turn messy meeting notes into a checked action summary. This is a guided prompting workflow, not an automated system.

#### Practice input

```text
Meeting: Mobile onboarding review
- Drop-off appears highest after identity verification, but analytics needs to confirm.
- Sara suggested shortening the help text. No decision was made.
- Dev will check event tracking by Thursday.
- The team agreed to test two versions of the progress indicator. Imran will draft the test plan; no date agreed.
- Legal wording may need review. Owner not discussed.
- Next review is 18 September.
```

#### Step-by-step instructions

1. **Open a new conversation**
   Use either ChatGPT or Claude. Do not paste real confidential meeting notes for this practice.
2. **Give the AI its job**
   Paste the master prompt below before adding the sample notes.
3. **Run the first version**
   Paste the sample meeting notes when requested. Read the full output before changing anything.
4. **Check the source**
   Compare every decision, action, owner and deadline with the original notes. Mark any unsupported detail.
5. **Ask for a correction**
   If the model invented or merged information, explain the specific error and ask it to regenerate only the affected row.
6. **Save the reusable version**
   Copy the final prompt into your notes and keep the [PASTE MEETING NOTES] placeholder.
7. **Run a second test**
   Change one line in the notes so an owner is missing. Confirm that the output says Not specified rather than guessing.

#### Prompt to use

```text
You help me organise meeting notes. Use only the notes I provide.

Create four sections:
1. Decisions made
2. Action items in a table with Action, Owner, Deadline and Supporting note
3. Open questions
4. Information that needs human review

Rules:
- Do not invent owners, deadlines or decisions.
- If information is missing, write 'Not specified'.
- Keep suggestions separate from confirmed decisions.
- Every action and decision must include a short supporting phrase from the notes.
- After the output, list any ambiguous statements you could not classify.

When you are ready, ask me to paste the meeting notes.

[PASTE MEETING NOTES]
```

#### Completion check

- [ ] Every claimed decision exists in the notes
- [ ] Missing owners and dates are marked, not invented
- [ ] Suggestions are not presented as decisions
- [ ] The learner saved a reusable prompt
- [ ] The learner tested at least one missing-information case

### Sunday Practice: Adapt it yourself: email thread to decisions and actions

**Independent challenge:** Without copying Day 6's instructions word for word, adapt the workflow to turn an email thread into decisions, actions and unresolved questions.

#### Rules

- Change the input description from meeting notes to an email thread
- Preserve who said what
- Do not treat a proposal as an agreed decision
- Add a field for the date of the latest relevant message
- Create one test where two people disagree

#### Reflection

1. What did you change and why?
2. What mistake did the AI make on the first run?
3. Which part of the workflow still requires a human?
4. Could you run the adapted prompt again next week without rewriting it?

**Sunday success signal:** The learner makes meaningful changes without being given a replacement prompt. Optional hints are acceptable; copying the completed Saturday prompt unchanged is not.

---

## Module 2: Customer Feedback: From Comments to Evidence-Backed Insights

**Audience:** Week 2 for basic learners; Week 1 entry point for advanced learners

**End-of-week capability:** By Day 7, the learner can use ChatGPT or Claude to analyse a set of customer comments, connect each insight to evidence and test whether the result is trustworthy.

**Weekday build components:**

- Day 1: Grounding rules
- Day 2: Retrieval mental model
- Day 3: Meaning-based grouping
- Day 4: Source preparation plan
- Day 5: Evaluation checklist

### Monday: Grounding: make the answer stand on evidence

**Hook:** A polished customer insight without supporting feedback is only a plausible opinion.

#### Theory

Grounding means requiring an AI response to be based on provided or retrieved source material. In this week, the source is a set of customer comments.

A grounded insight should be inspectable. A reviewer should be able to move from the conclusion back to the comments that support it. This is why evidence identifiers and short quotations matter.

Grounding does not prove that the source itself is complete or unbiased. Ten comments from unhappy customers do not automatically represent the entire customer base. AI can organise the evidence; it cannot repair a poor research sample.

Useful rules include: use only the supplied feedback, separate observation from interpretation, cite comment IDs and say 'insufficient evidence' when the data does not support a conclusion.

**Example:** Unsupported: 'Customers hate onboarding.' Grounded: 'Three of eight comments mention confusion during identity verification: C2, C5 and C8.'

**Do this now:** Rewrite the unsupported insight so it states the evidence, scope and uncertainty.

**Keep for Saturday:** Four grounding rules for Day 6's workflow.

#### Three-question check

1. **What makes an AI insight grounded?**
   - A. It is written confidently
   - B. It can be traced to relevant source material
   - C. It is longer than the feedback
   - D. It contains business jargon
   - **Correct option:** B
   - **Explanation:** Grounding connects conclusions to inspectable evidence.
2. **What should the workflow do when evidence is too weak?**
   - A. Invent a likely explanation
   - B. Say there is insufficient evidence
   - C. Repeat the claim more strongly
   - D. Remove all source IDs
   - **Correct option:** B
   - **Explanation:** Uncertainty should be visible rather than filled with plausible text.
3. **Does grounding guarantee representative research?**
   - A. Yes
   - B. Only with quotations
   - C. No; source quality and sampling still matter
   - D. Yes, when the answer is a table
   - **Correct option:** C
   - **Explanation:** Grounding limits the model to evidence but does not correct biased or incomplete evidence.

### Tuesday: RAG: retrieve before you generate

**Hook:** When the source collection becomes too large, the model should not guess which part matters. It needs a retrieval step.

#### Theory

RAG stands for retrieval-augmented generation. It describes a pattern: first retrieve relevant source material, then give that material to a language model so it can generate an answer grounded in the retrieved evidence.

Think of an open-book exam. Retrieval is finding the right pages; generation is writing the answer using those pages. A good writer with the wrong pages still produces a poor answer.

RAG is useful when answers must rely on a changing or private collection such as research reports, policies, customer feedback or product documentation. It is unnecessary for every task.

This week's ChatGPT/Claude exercise will imitate the grounded behaviour using a small uploaded or pasted dataset. It will not create a production RAG system or vector database.

**Example:** Question: 'Why are customers abandoning onboarding?' Retrieval selects comments about onboarding; generation produces themes and citations using only those comments.

**Do this now:** Draw or describe the three stages: user question, relevant evidence, grounded answer.

**Keep for Saturday:** A plain-English description of retrieval and generation for the workflow.

#### Three-question check

1. **What happens first in RAG?**
   - A. Generate a final answer
   - B. Retrieve relevant source material
   - C. Design a user interface
   - D. Delete the source
   - **Correct option:** B
   - **Explanation:** The retrieved evidence is supplied to the model before it generates the answer.
2. **Which task is a strong RAG candidate?**
   - A. Rewrite one sentence
   - B. Answer questions from a changing internal policy collection
   - C. Choose an emoji
   - D. Correct a spelling mistake
   - **Correct option:** B
   - **Explanation:** RAG helps when responses need relevant evidence from a larger, changing source collection.
3. **Will Day 6 create a production RAG system?**
   - A. Yes
   - B. No; it demonstrates grounded behaviour with a small source set
   - C. Yes, including a vector database
   - D. Only if the prompt is long
   - **Correct option:** B
   - **Explanation:** The MVP exercise teaches the pattern honestly without claiming that a chat prompt is a deployed RAG application.

### Wednesday: Embeddings and vectors: finding meaning, not just matching words

**Hook:** A customer can say 'I got stuck proving who I am' without ever using the words 'identity verification'. A keyword search may miss the connection.

#### Theory

An embedding is a numerical representation of meaning. The numbers form a vector. Text with similar meaning tends to be represented closer together in this numerical space.

Vector search uses this representation to find semantically similar material, even when the wording is different. This is why 'login keeps failing' can be connected with 'cannot access my account'.

A vector database stores and searches these representations efficiently. Product managers do not need to calculate the vectors, but they should understand the product behaviour: what content is indexed, what gets retrieved and what happens when retrieval is poor.

Semantic similarity is not the same as truth or importance. A similar comment may still be irrelevant to the user's question. Retrieval results need filters, ranking and evaluation.

**Example:** Keyword match looks for 'verification'. Semantic search may also find 'the selfie check kept rejecting me' because the meaning is related.

**Do this now:** Group three differently worded phrases that mean the same customer problem.

**Keep for Saturday:** Two pairs of differently worded but semantically similar feedback statements.

#### Three-question check

1. **What is an embedding?**
   - A. A visual dashboard
   - B. A numerical representation of meaning
   - C. A final AI answer
   - D. A privacy policy
   - **Correct option:** B
   - **Explanation:** Embeddings allow systems to compare semantic similarity mathematically.
2. **Why can vector search outperform keyword search?**
   - A. It always knows the truth
   - B. It can find similar meanings expressed with different words
   - C. It removes the need for source data
   - D. It writes longer answers
   - **Correct option:** B
   - **Explanation:** Semantic representations capture related meaning beyond exact word matches.
3. **Does semantic similarity prove relevance?**
   - A. Always
   - B. No; similar items can still be wrong for the question
   - C. Only for customer feedback
   - D. Yes, if stored in a vector database
   - **Correct option:** B
   - **Explanation:** Retrieval quality must be evaluated in the context of the user's need.

### Thursday: Chunking and metadata decide what the AI can find

**Hook:** If you cut a document in the wrong places, the answer may retrieve half a thought and lose the evidence around it.

#### Theory

Large source collections are often divided into smaller pieces called chunks before retrieval. A chunk might be a paragraph, a feedback comment, a support ticket or a section of a document.

Chunks that are too large can mix unrelated ideas. Chunks that are too small can lose context. For customer feedback, keeping one full comment with its ID and metadata is usually a sensible starting point.

Metadata is information about the source, such as date, customer type, product area, geography or research round. It allows retrieval and analysis to filter the evidence instead of mixing everything together.

Never split evidence in a way that disconnects a quotation from its source ID. The goal is not merely to help the model answer; it is to make the answer auditable.

**Example:** Useful feedback record: C07 | 14 Aug | New customer | Onboarding | 'The selfie check failed three times.'

**Do this now:** Turn one paragraph of feedback into a clean record with ID, date, segment, topic and full comment.

**Keep for Saturday:** The feedback record format that will be used on Day 6.

#### Three-question check

1. **What is chunking?**
   - A. Deleting difficult feedback
   - B. Dividing source material into retrievable pieces
   - C. Generating a final report
   - D. Changing every comment into one word
   - **Correct option:** B
   - **Explanation:** Retrieval systems commonly work with smaller source units rather than an entire collection at once.
2. **Why keep a source ID with each comment?**
   - A. To make the table longer
   - B. To trace conclusions back to evidence
   - C. To reveal customer identity
   - D. To improve grammar
   - **Correct option:** B
   - **Explanation:** Stable IDs make citations and review possible without exposing personal details.
3. **What can metadata help the workflow do?**
   - A. Filter by segment or product area
   - B. Guarantee every conclusion
   - C. Replace the comment text
   - D. Avoid all human review
   - **Correct option:** A
   - **Explanation:** Metadata provides useful constraints for retrieval and analysis.

### Friday: Evals: test the workflow, not just the demo

**Hook:** A workflow that succeeds on one carefully chosen example has shown a demo, not reliability.

#### Theory

An evaluation, often shortened to eval, is a structured way to test whether an AI system produces acceptable results. An eval needs an input, an expected behaviour and a way to judge the output.

For feedback analysis, useful criteria include evidence coverage, citation accuracy, unsupported claims, correct separation of themes and visibility of uncertainty.

Create a small test set containing normal cases and edge cases. Edge cases might include one comment with two themes, contradictory comments, an empty comment or a claim with no supporting evidence.

Some checks can be objective, such as whether every cited ID exists. Others require human judgement, such as whether two themes were merged incorrectly. Record both rather than pretending quality is a single automatic score.

**Example:** Test: one comment praises speed but criticises unclear fees. Expected behaviour: preserve both themes rather than labelling the entire comment positive or negative.

**Do this now:** Write three test cases: a normal comment, a two-theme comment and an irrelevant comment.

**Keep for Saturday:** A five-point evaluation checklist and three test cases.

#### Three-question check

1. **What does an eval require?**
   - A. Only a polished output
   - B. Input, expected behaviour and a judgement method
   - C. A vector database
   - D. A public leaderboard
   - **Correct option:** B
   - **Explanation:** An eval defines what good behaviour looks like and how it will be checked.
2. **Which is an edge case for feedback analysis?**
   - A. A clear single-theme comment
   - B. A comment containing praise and criticism
   - C. A table header
   - D. The workflow title
   - **Correct option:** B
   - **Explanation:** Mixed or ambiguous inputs test whether the workflow oversimplifies evidence.
3. **Can all feedback quality checks be fully automatic?**
   - A. Yes
   - B. No; some require human judgement
   - C. Only citation checks need humans
   - D. Yes, when using RAG
   - **Correct option:** B
   - **Explanation:** Interpretation quality and theme boundaries often need a reviewer.

### Saturday Build: Build a grounded customer-feedback analysis workflow

**Estimated time:** 30-40 minutes

**Outcome:** Use ChatGPT or Claude to turn a small feedback dataset into themes with traceable evidence. This is a manual, source-grounded workflow inside a chat tool, not a production RAG implementation.

#### Practice input

```text
C01 | Existing user | Search | 'I can never find last month's saved report.'
C02 | New user | Onboarding | 'The identity check rejected my photo twice and I nearly gave up.'
C03 | Existing user | Reporting | 'Export is fast, but the CSV column names are confusing.'
C04 | New user | Onboarding | 'Setup was quick. The progress indicator helped.'
C05 | Existing user | Search | 'Saved reports disappear from the first page, so I recreate them.'
C06 | Existing user | Reporting | 'I need a PDF for directors; CSV is not enough.'
C07 | New user | Onboarding | 'I did not understand why a selfie was required.'
C08 | Existing user | General | 'The new colours look nice.'
C09 | Existing user | Search | 'Could not locate a report after renaming it.'
C10 | New user | Onboarding | 'Verification worked first time, but I was worried about how the photo would be used.'
```

#### Step-by-step instructions

1. **Start with the question**
   Ask: What are the most evidenced customer problems, and what should the product team investigate next?
2. **Paste the source**
   Use the ten mock comments. Keep every comment ID attached.
3. **Set grounding rules**
   Paste the master prompt and require the tool to use only the supplied comments.
4. **Inspect the evidence**
   Open every cited comment and confirm that it supports the theme.
5. **Challenge the answer**
   Ask the AI to identify its weakest theme and explain why the evidence may be insufficient.
6. **Run the edge cases**
   Add one contradictory comment and one irrelevant comment. Check whether the themes remain sensible.
7. **Record the evaluation**
   Score citation accuracy, unsupported claims, theme separation, uncertainty and usefulness as Pass/Needs work.

#### Prompt to use

```text
Analyse the customer feedback provided below using only that source material.

Question: What are the most evidenced customer problems, and what should the product team investigate next?

Return:
1. A theme table with Theme, Description, Number of supporting comments, Comment IDs, Short evidence excerpts and Confidence (High/Medium/Low).
2. Contradictory or positive evidence that challenges each theme.
3. Comments that do not provide enough evidence for a product conclusion.
4. Three investigation questions for the product team.

Rules:
- Do not invent customers, causes, frequencies or quotations.
- Do not claim that this small sample represents all customers.
- A theme needs at least two supporting comments; otherwise label it 'Emerging signal'.
- Preserve multiple meanings when one comment contains more than one point.
- Cite comment IDs for every conclusion.

Before answering, confirm how many comments you received.

[PASTE FEEDBACK RECORDS]
```

#### Completion check

- [ ] Every theme cites valid comment IDs
- [ ] Quotations match the source
- [ ] Small-sample limitations are visible
- [ ] Contradictory evidence is not hidden
- [ ] The learner ran at least two edge cases

### Sunday Practice: Adapt it yourself: research notes to evidence-backed findings

**Independent challenge:** Adapt Day 6's workflow to analyse short research notes rather than customer comments.

#### Rules

- Replace customer IDs with source-note IDs
- Separate observed behaviour from participant opinion
- Add a field for research question
- Do not count repeated notes from the same participant as separate people
- Create one note that contradicts the dominant theme

#### Reflection

1. Did every finding remain traceable?
2. What did the AI overgeneralise?
3. Which source-preparation choice improved the result?
4. What would need to change before this could be used with real company research?

**Sunday success signal:** The learner makes meaningful changes without being given a replacement prompt. Optional hints are acceptable; copying the completed Saturday prompt unchanged is not.

---

## Module 3: Feature Requests: Classify, Prioritise and Route Work

**Audience:** Applied module for both learner paths

**End-of-week capability:** By Day 7, the learner can create and test a repeatable ChatGPT/Claude workflow that classifies incoming requests, explains its reasoning and sends uncertain items for human review.

**Weekday build components:**

- Day 1: Taxonomy
- Day 2: Classification criteria
- Day 3: Structured schema
- Day 4: Confidence and review rules
- Day 5: Routing tests

### Monday: A taxonomy gives AI a shared filing system

**Hook:** If your categories overlap, AI will not repair them. It will simply make the inconsistency faster.

#### Theory

A taxonomy is a defined system of categories. For feature requests, categories might represent product area, request type or customer problem.

Good categories are understandable, useful for a decision and as distinct as practical. 'Dashboard', 'Reporting' and 'Better experience' overlap unless each has a definition.

Include an Other or Needs review category. Forcing every request into a named category makes the data look tidy while hiding uncertainty.

Start with a small taxonomy that supports a real downstream action. Add categories only when repeated evidence shows they are needed.

**Example:** Category: Reporting export. Include requests about PDF, CSV or scheduled export. Exclude requests about finding saved reports; those belong to Search and discovery.

**Do this now:** Define four categories for a product inbox, including what belongs and what does not.

**Keep for Saturday:** A four-category taxonomy plus Needs review.

#### Three-question check

1. **What is a taxonomy?**
   - A. A generated summary
   - B. A defined system of categories
   - C. A model price list
   - D. A design prototype
   - **Correct option:** B
   - **Explanation:** A taxonomy creates a shared structure for classification.
2. **Why include Needs review?**
   - A. To hide difficult requests
   - B. To make uncertainty visible
   - C. To reduce the number of inputs
   - D. To replace every category
   - **Correct option:** B
   - **Explanation:** Some inputs will not fit cleanly and should not be forced.
3. **Which taxonomy is more useful?**
   - A. Good/Bad/Interesting
   - B. Defined categories linked to downstream work
   - C. A new category for every ticket
   - D. Categories with no definitions
   - **Correct option:** B
   - **Explanation:** A taxonomy should support consistent decisions and actions.

### Tuesday: Classification needs criteria, not vibes

**Hook:** Two requests can use different words and still belong to the same category. The classifier needs rules for meaning.

#### Theory

Classification assigns an input to one or more predefined categories. The quality depends on category definitions, examples and decision rules.

Give the model positive examples and difficult boundary examples. A request to 'download a saved report' could involve export or search; the user's actual problem determines the category.

Decide whether an item may have more than one label. Multi-label classification can preserve meaning, but it can also create noisy data when used without rules.

Require a short evidence phrase from the request. This makes the classification easier to inspect and helps reviewers see whether the model focused on the right words.

**Example:** Request: 'Let me receive a PDF every Monday.' Labels: Reporting export + Scheduled delivery. Evidence: 'PDF every Monday'.

**Do this now:** Write one clear example and one boundary example for each of two categories.

**Keep for Saturday:** Classification rules and examples.

#### Three-question check

1. **What should drive classification?**
   - A. The longest word
   - B. Defined meaning and criteria
   - C. The requester's job title only
   - D. Random choice
   - **Correct option:** B
   - **Explanation:** The system needs explicit category boundaries and evidence.
2. **Why request an evidence phrase?**
   - A. To make outputs longer
   - B. To inspect why the label was chosen
   - C. To hide the source
   - D. To guarantee the model is correct
   - **Correct option:** B
   - **Explanation:** Evidence improves traceability but still needs review.
3. **When is multi-label classification useful?**
   - A. When an item genuinely contains multiple relevant meanings
   - B. For every input
   - C. When categories have no definitions
   - D. Only for positive feedback
   - **Correct option:** A
   - **Explanation:** Multi-label output should preserve real overlap, not become a default escape route.

### Wednesday: Structured output makes AI results usable

**Hook:** A paragraph can sound smart and still be difficult to sort, compare or pass to another step.

#### Theory

Structured output means asking the AI to return information in defined fields. For a request, fields might include ID, category, problem statement, urgency, evidence and recommended owner.

A consistent schema makes results easier to review and eventually easier to pass into another tool. The field definitions matter as much as the table itself.

Do not confuse format compliance with correctness. A perfectly formatted row can still contain an invented priority or the wrong category.

Use allowed values where consistency matters. For example, confidence must be High, Medium or Low rather than any phrase the model chooses.

**Example:** ID: R04 | Category: Reporting export | Confidence: High | Evidence: 'Need PDF download' | Review: No.

**Do this now:** Create a seven-field output schema for the Day 6 workflow.

**Keep for Saturday:** The final request-classification schema.

#### Three-question check

1. **What is a structured output?**
   - A. Any long answer
   - B. An answer returned in defined fields
   - C. A colourful answer
   - D. An answer without a source
   - **Correct option:** B
   - **Explanation:** Defined fields make results easier to compare, review and reuse.
2. **Does correct formatting guarantee correct classification?**
   - A. Yes
   - B. No
   - C. Only in a table
   - D. Only with seven fields
   - **Correct option:** B
   - **Explanation:** Structure improves usability, not factual or judgement accuracy.
3. **Why use allowed values for confidence?**
   - A. To make comparison consistent
   - B. To remove every uncertainty
   - C. To generate more categories
   - D. To avoid defining confidence
   - **Correct option:** A
   - **Explanation:** A controlled set prevents inconsistent labels such as 'fairly sure' and 'almost high'.

### Thursday: Confidence should change what happens next

**Hook:** A confidence label is decoration unless it changes the workflow.

#### Theory

Confidence represents how strongly the available evidence supports a classification. It should be defined using observable conditions, not the model's mood.

For example: High means the request clearly matches one category and includes direct evidence; Medium means two categories are plausible; Low means the request is incomplete or outside the taxonomy.

Human-in-the-loop means a person reviews or decides at an appropriate point. Low-confidence items, high-impact requests and policy exceptions are common review candidates.

The goal is not to remove humans from the process. It is to focus human attention where judgement is most valuable.

**Example:** 'Make reports better' lacks a specific problem. Confidence: Low. Route: Needs clarification, not Reporting backlog.

**Do this now:** Define High, Medium and Low confidence and attach a next action to each.

**Keep for Saturday:** Confidence thresholds and human-review rules.

#### Three-question check

1. **When is a confidence label useful?**
   - A. When it changes the next action
   - B. When every item is High
   - C. When it has no definition
   - D. When reviewers never see it
   - **Correct option:** A
   - **Explanation:** Confidence should control routing, review or clarification.
2. **Which item most likely needs human review?**
   - A. A clear request matching one category
   - B. An incomplete request matching two categories
   - C. A correctly formatted ID
   - D. A known duplicate
   - **Correct option:** B
   - **Explanation:** Ambiguity and missing information reduce confidence.
3. **What is human-in-the-loop?**
   - A. A human reviews or decides at a defined point
   - B. A fully manual process with no AI
   - C. A hidden prompt
   - D. A confidence score only
   - **Correct option:** A
   - **Explanation:** The workflow explicitly reserves consequential or uncertain decisions for people.

### Friday: Routing turns classification into action

**Hook:** Sorting a ticket is not the outcome. The outcome is getting it to the right next step.

#### Theory

Routing uses classification and rules to decide what happens next. A request may go to a product area, a clarification queue, a duplicate review or a high-impact escalation.

Keep classification and priority separate. A request can clearly belong to Reporting but still have unknown urgency. Priority should use defined evidence such as affected users, business impact, risk and strategic fit.

Test routing with boundary cases: missing context, multiple categories, emotionally strong wording without evidence, duplicate requests and possible security or legal issues.

A good routing output explains the reason and makes escalation visible. It should not silently make irreversible decisions.

**Example:** Category: Access. Security indicator: Possible. Confidence: Medium. Route: Security review before product backlog.

**Do this now:** Create five IF/THEN routing rules and one rule that always requires human review.

**Keep for Saturday:** Routing rules plus a Day 5 test set.

#### Three-question check

1. **What does routing determine?**
   - A. The next action or destination
   - B. The font used in the output
   - C. Whether the AI is popular
   - D. The length of the source
   - **Correct option:** A
   - **Explanation:** Classification becomes useful when it leads to an appropriate next step.
2. **Are category and priority the same?**
   - A. Yes
   - B. No; they answer different questions
   - C. Only for urgent tickets
   - D. Only in a spreadsheet
   - **Correct option:** B
   - **Explanation:** Category describes what the request concerns; priority evaluates importance using separate evidence.
3. **Which should trigger special review?**
   - A. Possible security or legal impact
   - B. A correctly spelled request
   - C. A common category
   - D. A short ticket ID
   - **Correct option:** A
   - **Explanation:** Consequential exceptions should be escalated rather than handled as ordinary classification.

### Saturday Build: Build a request classification and routing workflow

**Estimated time:** 30-40 minutes

**Outcome:** Use ChatGPT or Claude to classify mock product requests, return a structured result and create an exception queue for uncertain or sensitive items.

#### Practice input

```text
R01 | 'Please let me export the dashboard as PDF.'
R02 | 'I renamed a saved report and now cannot find it.'
R03 | 'Make the homepage nicer.'
R04 | 'Can finance receive a CSV automatically every Monday?'
R05 | 'The app showed another customer's name for one second.'
R06 | 'Add dark mode.'
R07 | 'The selfie check failed, but I do not know whether it was the camera or my connection.'
R08 | 'We need the same dashboard our competitor has.'
```

#### Step-by-step instructions

1. **Define the taxonomy**
   Use: Search and discovery, Reporting export, Scheduled delivery, Onboarding, Interface preference, Needs review.
2. **Add the output schema**
   Require ID, category, problem, evidence, confidence, route and review reason.
3. **Add confidence rules**
   Make the High/Medium/Low definitions explicit.
4. **Add routing rules**
   Possible data exposure, security or legal concerns must go to Human review regardless of confidence.
5. **Run the mock requests**
   Paste all eight requests and inspect each row.
6. **Challenge three results**
   Ask why R03, R05 and R08 were routed that way. Reject unsupported assumptions.
7. **Test a new request**
   Write one deliberately ambiguous request and confirm it enters Needs review.

#### Prompt to use

```text
Classify and route each product request using only the request text and the rules below.

Categories:
- Search and discovery
- Reporting export
- Scheduled delivery
- Onboarding
- Interface preference
- Needs review

Confidence:
- High: one category clearly matches direct evidence
- Medium: more than one category is plausible
- Low: the request is vague, incomplete or outside the taxonomy

Return a table with: ID, Category, Customer problem, Evidence phrase, Confidence, Route, Human-review reason.

Routing rules:
- Low confidence -> Clarification queue
- Medium confidence -> Product review
- High confidence -> Named category backlog
- Any possible privacy, security, legal or customer-data issue -> Urgent human review
- Do not infer priority from emotional wording alone
- Do not invent customer impact or scale

After the table, list possible duplicates and inputs that need a new category.

[PASTE REQUESTS]
```

#### Completion check

- [ ] Every label uses the defined taxonomy
- [ ] Every row includes evidence
- [ ] Ambiguous items are not forced
- [ ] Sensitive items reach human review
- [ ] The learner distinguishes category from priority

### Sunday Practice: Adapt it yourself: support tickets to product signals

**Independent challenge:** Adapt the workflow to classify support tickets by issue type and route them either to support, engineering, product review or urgent escalation.

#### Rules

- Create a new support-ticket taxonomy
- Preserve the original ticket ID
- Add a field for reproduction information
- Escalate possible account or data exposure
- Test one ticket with two plausible categories

#### Reflection

1. Which categories overlapped?
2. What information was most often missing?
3. Did confidence lead to the correct next action?
4. Which routes should never be decided by AI alone?

**Sunday success signal:** The learner makes meaningful changes without being given a replacement prompt. Optional hints are acceptable; copying the completed Saturday prompt unchanged is not.

---

## Module 4: Product Communication: Turn Messy Inputs into Clear Updates

**Audience:** Applied module for both learner paths

**End-of-week capability:** By Day 7, the learner can build a reusable ChatGPT/Claude workflow that converts verified product inputs into different stakeholder updates without inventing progress or hiding risk.

**Weekday build components:**

- Day 1: Audience contract
- Day 2: Source hierarchy
- Day 3: Synthesis rules
- Day 4: Output templates
- Day 5: Quality checks

### Monday: The audience changes the answer

**Hook:** A useful engineering update and a useful executive update may describe the same week without using the same detail.

#### Theory

Audience design means deciding what a particular reader needs to know, decide or do. Tone is only one part; relevance and level of detail matter more.

Define the reader, purpose, decision and expected length before asking AI to write. An executive may need progress, risk and decisions. A delivery team may need dependencies, owners and next steps.

Do not ask AI to make an update 'sound positive' when the real requirement is clarity. The workflow should preserve material risks even when it shortens the source.

A useful audience contract says what must always remain and what can be removed. This prevents personalisation from becoming distortion.

**Example:** Executive: outcome, change, risk, decision. Delivery team: completed work, blockers, owner, dependency, next action.

**Do this now:** Write an audience contract for a director receiving a weekly product update.

**Keep for Saturday:** Audience, purpose, required information and length.

#### Three-question check

1. **What should be defined before generating an update?**
   - A. Only the tone
   - B. Reader, purpose, decision and length
   - C. A dramatic persona
   - D. The number of adjectives
   - **Correct option:** B
   - **Explanation:** These choices determine relevance and detail.
2. **What must happen to a material risk in a shorter update?**
   - A. It should remain visible
   - B. It should be removed
   - C. It should become a success
   - D. It should be replaced by jargon
   - **Correct option:** A
   - **Explanation:** Compression must not hide important risk.
3. **What is an audience contract?**
   - A. A legal agreement
   - B. A definition of what the reader needs and what must be preserved
   - C. A list of model names
   - D. A hidden system prompt
   - **Correct option:** B
   - **Explanation:** It guides useful adaptation without distorting facts.

### Tuesday: Source hierarchy: tell AI what wins when inputs disagree

**Hook:** The roadmap says launch is Friday. The delivery notes say the security review is unfinished. Which source should the update trust?

#### Theory

Product updates often combine metrics, meeting notes, ticket status and informal comments. These sources can conflict or have different levels of authority.

A source hierarchy tells the workflow which information is authoritative. For example, verified analytics may outrank an estimate; the current delivery tracker may outrank an old planning document.

The workflow should surface conflicts rather than silently choosing the most convenient statement. Ask it to list disagreements and missing evidence before drafting the final update.

Give every input a label such as VERIFIED METRIC, DELIVERY STATUS, DECISION LOG or UNCONFIRMED NOTE. Labels make the model's job and the human review clearer.

**Example:** Verified delivery tracker: launch blocked. Old roadmap: launch Friday. Output: 'Launch date at risk; roadmap is not yet updated.'

**Do this now:** Rank four product sources from most to least authoritative and explain the choice.

**Keep for Saturday:** A source hierarchy and conflict rule.

#### Three-question check

1. **Why define a source hierarchy?**
   - A. To decide which source is authoritative when inputs conflict
   - B. To make the prompt longer
   - C. To remove all sources
   - D. To guarantee a launch date
   - **Correct option:** A
   - **Explanation:** The workflow needs an explicit rule rather than silently choosing.
2. **What should AI do with conflicting sources?**
   - A. Hide the conflict
   - B. Surface it for review
   - C. Choose the most positive statement
   - D. Average the sentences
   - **Correct option:** B
   - **Explanation:** Conflicts can be material and need human judgement.
3. **Which label signals that a statement needs caution?**
   - A. VERIFIED METRIC
   - B. UNCONFIRMED NOTE
   - C. DECISION LOG
   - D. APPROVED STATUS
   - **Correct option:** B
   - **Explanation:** The label prevents speculation from being presented as settled fact.

### Wednesday: Synthesis is selection with accountability

**Hook:** Summarising removes information. Good synthesis explains what deserves to survive that removal.

#### Theory

Summarisation compresses information. Synthesis connects information from several sources to produce a useful view. It may identify progress, dependencies, changes, risks and decisions.

A synthesis rule tells AI what to preserve: material changes since last week, blocked outcomes, decisions required and metrics that changed beyond a defined threshold.

Ask the model to separate fact, interpretation and recommendation. 'Conversion fell 4%' is a fact if verified. 'Users dislike the new design' is an interpretation unless supported by research.

Require traceability for important claims using source labels. The final prose can be concise while the review version retains references.

**Example:** Fact: completion fell from 62% to 58%. Interpretation: identity verification may be contributing. Recommendation: review verification-stage analytics before changing the flow.

**Do this now:** Separate three statements into fact, interpretation and recommendation.

**Keep for Saturday:** Synthesis rules and the fact/interpretation/recommendation structure.

#### Three-question check

1. **How does synthesis differ from simple summarisation?**
   - A. It connects and selects information for a purpose
   - B. It is always shorter
   - C. It removes sources
   - D. It guarantees a recommendation
   - **Correct option:** A
   - **Explanation:** Synthesis combines sources around a decision or question.
2. **Which statement is an interpretation?**
   - A. Completion changed from 62% to 58%
   - B. Users may be confused by verification
   - C. Review the funnel
   - D. The tracker was updated Tuesday
   - **Correct option:** B
   - **Explanation:** It explains a possible cause and needs supporting evidence.
3. **Why retain source labels during review?**
   - A. To trace important claims
   - B. To improve the colour of the update
   - C. To remove human judgement
   - D. To guarantee positive tone
   - **Correct option:** A
   - **Explanation:** Reviewers can check how a conclusion was formed.

### Thursday: Templates create consistency without making every update identical

**Hook:** A blank page asks the writer to remember the format, the audience and every risk, every single week.

#### Theory

A template defines the stable structure of an output while placeholders hold changing information. It reduces the effort of starting and makes omissions easier to notice.

For an executive product update, a useful template might include outcome, evidence, progress, risk, decision required and next milestone. For the team version, it might include owner and dependency.

Templates should not force content where none exists. If no decision is required, write 'No decision required' rather than inventing one.

Create separate templates for genuinely different audiences, but reuse a shared factual core. This reduces contradictory versions.

**Example:** Shared core: verified facts and risks. Executive output: three bullets. Team output: detailed actions and owners.

**Do this now:** Design a six-section executive update template with instructions for missing information.

**Keep for Saturday:** Executive and team output templates.

#### Three-question check

1. **What is the main benefit of an output template?**
   - A. Consistent structure and fewer omissions
   - B. Guaranteed truth
   - C. No need for source data
   - D. The same wording every week
   - **Correct option:** A
   - **Explanation:** Templates support repeatability while content still changes.
2. **What should happen if no decision is required?**
   - A. Invent a decision
   - B. State that no decision is required
   - C. Delete every section
   - D. Ask the model to guess
   - **Correct option:** B
   - **Explanation:** A template should expose absence rather than manufacture content.
3. **How can multiple audience versions remain consistent?**
   - A. Use a shared factual core
   - B. Generate each from memory
   - C. Hide risks in one version
   - D. Use different source data
   - **Correct option:** A
   - **Explanation:** Audience adaptation should change detail, not the underlying facts.

### Friday: Critique before polish

**Hook:** Once AI has polished the prose, missing evidence becomes harder to see.

#### Theory

Use a two-pass workflow. Pass one creates a factual review table with sources, conflicts and gaps. Pass two creates the audience-ready update only after the human checks pass one.

A critique prompt asks the model to identify weaknesses rather than rewrite immediately. Useful checks include unsupported claims, hidden risks, conflicting dates, vague ownership and invented certainty.

Do not use the model as the only evaluator of its own answer. Combine automated critique with source comparison and human judgement.

Define completion criteria: every metric matches the source, every risk remains visible, conflicts are resolved or flagged and the decision request is explicit.

**Example:** Pass one flags that 'on track' conflicts with an unresolved security dependency. Pass two says 'Target remains Friday, subject to security approval.'

**Do this now:** Create a five-question pre-publication checklist.

**Keep for Saturday:** The two-pass process and final quality checklist.

#### Three-question check

1. **Why use a factual review pass before polished prose?**
   - A. To expose conflicts and missing evidence
   - B. To make the update longer
   - C. To remove source labels early
   - D. To avoid human review
   - **Correct option:** A
   - **Explanation:** Polish can make weak claims look more credible.
2. **Should AI be the only evaluator of its own update?**
   - A. Yes
   - B. No
   - C. Only for executives
   - D. Only when the prose is short
   - **Correct option:** B
   - **Explanation:** Source checks and human judgement remain necessary.
3. **Which is a strong completion criterion?**
   - A. The tone sounds confident
   - B. Every metric matches its source
   - C. The update uses five adjectives
   - D. Every risk is removed
   - **Correct option:** B
   - **Explanation:** Completion criteria should test accuracy and decision usefulness.

### Saturday Build: Build a two-pass stakeholder update workflow

**Estimated time:** 30-40 minutes

**Outcome:** Use ChatGPT or Claude to review mixed product inputs, flag conflicts and then produce an executive update and a delivery-team update from one factual core.

#### Practice input

```text
[VERIFIED METRIC] Onboarding completion: 62% last week, 58% this week.
[DELIVERY STATUS] New progress indicator built; QA starts Wednesday.
[DELIVERY STATUS] Security review for analytics events is not complete.
[OLD ROADMAP] Release target: Friday.
[DECISION LOG] No decision to delay release has been made.
[UNCONFIRMED NOTE] The verification vendor may be causing the conversion decline.
[RISK] If security approval is not received by Thursday noon, Friday release is unlikely.
[ACTION] Maya owns QA. Dev owns the security follow-up.
[NEXT MILESTONE] Go/no-go review Thursday 15:00.
```

#### Step-by-step instructions

1. **Label the inputs**
   Keep the source labels shown in the sample.
2. **Run pass one**
   Ask for facts, interpretations, conflicts, gaps, risks and decisions.
3. **Review pass one**
   Confirm that the vendor explanation remains unconfirmed and that Friday is not described as guaranteed.
4. **Resolve nothing silently**
   Leave unresolved conflicts visible or add a human resolution before continuing.
5. **Run pass two**
   Generate the executive and delivery-team versions from the reviewed factual core.
6. **Compare the versions**
   Verify that both versions retain the same metrics, release status and material risk.
7. **Save the template**
   Replace the sample with [PASTE LABELLED INPUTS] for future use.

#### Prompt to use

```text
You will create a product update in two passes using only the labelled inputs I provide.

PASS 1 - FACTUAL REVIEW
Return a table with: Claim, Type (Fact/Interpretation/Recommendation), Source label, Conflict or gap, Human check required.
Then list:
- material changes since the previous period
- risks and dependencies
- decisions required
- statements that must not appear as confirmed
Do not draft the stakeholder update yet. Ask me to confirm or correct the factual review.

PASS 2 - ONLY AFTER I CONFIRM
Create:
A. Executive update: Outcome, Evidence, Progress, Risk, Decision required, Next milestone. Maximum 180 words.
B. Delivery-team update: Completed, In progress, Blockers, Owners, Dependencies, Next actions.

Rules:
- Use one shared factual core.
- Never invent status, cause, owner or date.
- Preserve material risks in both versions.
- If sources conflict, state the conflict.
- Keep unconfirmed explanations labelled as unconfirmed.

[PASTE LABELLED INPUTS]
```

#### Completion check

- [ ] Pass one happens before prose
- [ ] Conflicts and gaps remain visible
- [ ] Both versions use the same facts
- [ ] Material risk appears in both versions
- [ ] No unconfirmed cause is presented as fact

### Sunday Practice: Adapt it yourself: convert the workflow into a launch update

**Independent challenge:** Adapt Day 6's workflow for a product launch update sent to commercial, support and operations leaders.

#### Rules

- Add readiness areas such as product, operations, support and compliance
- Keep one shared factual core
- Create a red/amber/green status rule
- Require evidence for every status
- Add an explicit owner for every blocker

#### Reflection

1. Did the audience change the facts or only the presentation?
2. Which conflict needed human resolution?
3. Was any RAG status unsupported?
4. What would make the workflow safe to reuse weekly?

**Sunday success signal:** The learner makes meaningful changes without being given a replacement prompt. Optional hints are acceptable; copying the completed Saturday prompt unchanged is not.

---

## Module 5: AI Prototyping: Turn an Idea into Testable Behaviour

**Audience:** Applied module for both learner paths

**End-of-week capability:** By Day 7, the learner can use ChatGPT or Claude to simulate an AI product behaviour, test it with realistic cases and distinguish a conversational prototype from a production product.

**Weekday build components:**

- Day 1: User problem
- Day 2: Behaviour contract
- Day 3: Interaction flow
- Day 4: Guardrails
- Day 5: Test plan

### Monday: Prototype the risky behaviour, not the entire product

**Hook:** The fastest prototype is not the one with the fewest screens. It is the one that tests the biggest uncertainty.

#### Theory

An AI prototype is a quick representation of how an AI-powered experience might behave. Its purpose is to learn, not to prove that the finished product already exists.

Start with a user problem and risky assumption. For example: can an AI turn a rough feature idea into useful clarification questions without pretending the idea is already good?

Choose one narrow behaviour to simulate. Do not attempt authentication, databases, analytics and production automation when the key question is whether the AI interaction is useful.

State what the prototype will not test. A chat-based simulation can test instructions, questions and output usefulness; it cannot prove scalability, security, latency or integration feasibility.

**Example:** Problem: PMs jump from idea to solution. Prototype behaviour: ask five evidence-seeking questions before generating a feature brief.

**Do this now:** Write one user problem, one risky assumption and one behaviour to prototype.

**Keep for Saturday:** The prototype learning goal and scope boundary.

#### Three-question check

1. **What should an early prototype focus on?**
   - A. Every production feature
   - B. The riskiest assumption or behaviour
   - C. A perfect visual design
   - D. A complete database
   - **Correct option:** B
   - **Explanation:** The prototype should maximise learning with minimal scope.
2. **What can a chat-based prototype test well?**
   - A. Interaction instructions and output usefulness
   - B. Production scalability
   - C. Enterprise security certification
   - D. Database performance
   - **Correct option:** A
   - **Explanation:** A conversational simulation tests behaviour, not production infrastructure.
3. **Why define what the prototype will not test?**
   - A. To avoid misleading conclusions
   - B. To make it look unfinished
   - C. To stop user feedback
   - D. To hide the learning goal
   - **Correct option:** A
   - **Explanation:** Clear boundaries prevent a useful simulation from being mistaken for a production-ready product.

### Tuesday: A behaviour contract tells the AI how to act

**Hook:** A prototype becomes testable when expected behaviour is explicit enough to pass or fail.

#### Theory

A behaviour contract describes the AI's role, goal, allowed information, sequence, output and boundaries. It is more precise than a general request to 'be helpful'.

Define the interaction sequence. The prototype might first ask questions, then wait, then produce a brief. Without a stop-and-wait instruction, models often jump directly to an answer.

Specify what the AI should do when information is missing: ask, label an assumption or refuse to conclude. Missing information is part of the interaction design.

Use observable language. 'Ask no more than five questions, one at a time' is testable. 'Be thoughtful' is not.

**Example:** Before creating a brief, ask one question at a time about user, problem evidence, current alternative, success measure and constraints.

**Do this now:** Write five observable behaviours for the prototype.

**Keep for Saturday:** A behaviour contract with sequence and stop conditions.

#### Three-question check

1. **What makes a behaviour testable?**
   - A. It is observable and specific
   - B. It sounds intelligent
   - C. It is very long
   - D. It contains a model name
   - **Correct option:** A
   - **Explanation:** A reviewer must be able to determine whether the behaviour occurred.
2. **Why include a stop-and-wait instruction?**
   - A. To prevent the AI jumping ahead
   - B. To make the response slower
   - C. To remove interaction
   - D. To guarantee accuracy
   - **Correct option:** A
   - **Explanation:** The prototype should follow the intended conversation sequence.
3. **What should happen when key information is missing?**
   - A. The AI invents it
   - B. The contract defines whether to ask or label an assumption
   - C. The prototype silently ends
   - D. The output becomes longer
   - **Correct option:** B
   - **Explanation:** Missing information needs explicit behaviour.

### Wednesday: Design the interaction as states

**Hook:** A good AI conversation is not one endless prompt. It moves through recognisable stages.

#### Theory

A state is a stage of the interaction with a purpose and an allowed next step. A simple prototype may have Discovery, Clarification, Draft and Review states.

State design helps prevent premature answers. The prototype should not enter Draft until the minimum information is collected or the missing assumptions are explicitly accepted.

Define transitions using simple conditions: after five questions, produce a summary; if the user corrects a fact, update the summary; if sensitive data appears, warn and ask for a redacted version.

The user should know what is happening. Short messages such as 'I have enough information to draft the brief' create clarity and control.

**Example:** Discovery -> five questions -> Confirm understanding -> Draft brief -> User critique -> Revised brief.

**Do this now:** Create four states and one transition rule between each state.

**Keep for Saturday:** The prototype state flow.

#### Three-question check

1. **What is a state in an AI interaction?**
   - A. A stage with a purpose and allowed next step
   - B. A model's physical location
   - C. A random response
   - D. A visual colour
   - **Correct option:** A
   - **Explanation:** States make conversational behaviour easier to design and test.
2. **When should the prototype move into Draft?**
   - A. Immediately
   - B. When minimum information is present or assumptions are explicit
   - C. After one compliment
   - D. Whenever the user says AI
   - **Correct option:** B
   - **Explanation:** The transition should depend on defined readiness.
3. **Why tell the user when the state changes?**
   - A. To create clarity and control
   - B. To expose hidden reasoning
   - C. To make every response longer
   - D. To avoid questions
   - **Correct option:** A
   - **Explanation:** The interface should communicate progress without revealing private chain-of-thought.

### Thursday: Guardrails define what the prototype must not do

**Hook:** The most important prototype instruction may be the action it refuses to take.

#### Theory

Guardrails are rules or controls that constrain unsafe, misleading or unwanted behaviour. They may concern privacy, unsupported claims, harmful content, sensitive decisions or product scope.

Prompt instructions are one layer, not a complete safety system. A production product may also need access controls, data handling rules, moderation, monitoring, audit logs and human approval.

Design a graceful fallback. Instead of inventing evidence, the prototype can say what is missing and ask a focused question. Instead of handling personal data, it can ask for anonymised input.

Avoid presenting the prototype as an authority. It can help structure a feature idea, but it should not approve a roadmap, make legal conclusions or claim customer demand without evidence.

**Example:** If the user provides no evidence, respond: 'I can draft this as a hypothesis, but I cannot describe it as a validated customer problem.'

**Do this now:** Write three prohibited behaviours and a safe fallback for each.

**Keep for Saturday:** The prototype guardrails and fallback messages.

#### Three-question check

1. **What is a guardrail?**
   - A. A rule or control limiting unwanted behaviour
   - B. A visual border
   - C. A success metric only
   - D. A longer output
   - **Correct option:** A
   - **Explanation:** Guardrails constrain how the AI should behave in risky or uncertain situations.
2. **Are prompt instructions a complete production safety system?**
   - A. Yes
   - B. No
   - C. Only for prototypes
   - D. Only when written in capitals
   - **Correct option:** B
   - **Explanation:** Production safety may require technical, operational and governance controls beyond prompts.
3. **What is a graceful fallback?**
   - A. Invent missing evidence
   - B. Explain what is missing and ask for a safe next input
   - C. End without explanation
   - D. Approve the idea anyway
   - **Correct option:** B
   - **Explanation:** A fallback preserves usefulness without pretending certainty.

### Friday: Test conversations reveal more than one perfect demo

**Hook:** Your prototype is not the happy path. It is how the behaviour changes when the input becomes messy.

#### Theory

A conversation test is a planned interaction used to check the behaviour contract. Create a normal case, a missing-information case, a contradictory case, a sensitive-data case and an out-of-scope case.

Write expected behaviour before running the test. Otherwise, it is easy to accept whatever the model produces and call it successful.

Capture failures as specific observations: asked two questions at once, invented evidence, skipped confirmation or ignored a constraint. Then change one instruction and rerun the same test.

A prototype is successful when it answers the learning question, even if the result shows the idea is not useful. Learning is the outcome; polish is secondary.

**Example:** Test: user says 'Everyone wants this feature' but provides no evidence. Expected: label it as an assumption and ask for the source.

**Do this now:** Write five test conversations and expected behaviours.

**Keep for Saturday:** The Day 5 test plan and success criteria.

#### Three-question check

1. **When should expected behaviour be written?**
   - A. Before running the test
   - B. After seeing the output
   - C. Only after launch
   - D. Never
   - **Correct option:** A
   - **Explanation:** Predefined expectations reduce the temptation to accept any result.
2. **Which is a specific failure observation?**
   - A. It was bad
   - B. It asked two questions at once despite the rule
   - C. I did not like it
   - D. The model is strange
   - **Correct option:** B
   - **Explanation:** Specific observations can guide a targeted change and retest.
3. **Can a prototype succeed by showing that an idea is not useful?**
   - A. Yes, if it answers the learning question
   - B. No
   - C. Only with a polished interface
   - D. Only after automation
   - **Correct option:** A
   - **Explanation:** The goal of prototyping is learning, including evidence against the idea.

### Saturday Build: Build a conversational Feature Brief Copilot prototype

**Estimated time:** 35-45 minutes

**Outcome:** Use ChatGPT or Claude to simulate an AI feature that questions a rough product idea before creating an evidence-aware feature brief. This tests conversational behaviour; it is not a coded or production-ready product.

#### Practice input

```text
Initial idea to test: 'We should add an AI chatbot to the onboarding screen because competitors have one.'
```

#### Step-by-step instructions

1. **Open a fresh conversation**
   Use ChatGPT or Claude so earlier context does not influence the prototype.
2. **Install the behaviour contract**
   Paste the prototype prompt below. The model should acknowledge the rules and ask for an idea.
3. **Run the normal case**
   Use the sample idea. Answer the questions with reasonable but incomplete information.
4. **Check the states**
   Confirm that it asks one question at a time, summarises understanding and waits for confirmation before drafting.
5. **Run the no-evidence case**
   Claim that everyone wants the feature. Confirm that the prototype labels this as an assumption.
6. **Run a privacy case**
   Mention that raw customer names will be pasted. Confirm that it requests anonymised material instead.
7. **Revise one instruction**
   Choose the largest failure, change one line in the behaviour contract and rerun the same test.
8. **Record the learning**
   Write what the prototype demonstrates and what it cannot demonstrate.

#### Prompt to use

```text
You are simulating a Feature Brief Copilot for product managers. Your purpose is to improve the definition of an early product idea before drafting a brief.

BEHAVIOUR
1. Ask for the rough idea.
2. Ask no more than five clarification questions, one at a time, covering: target user, problem evidence, current alternative, desired outcome and constraints. Wait after every question.
3. Separate facts supplied by the user from assumptions. Never invent research, metrics or customer demand.
4. After the questions, summarise your understanding under Facts, Assumptions and Missing information. Ask the user to confirm or correct it. Do not draft until confirmed.
5. After confirmation, create a feature brief with: User, Problem, Evidence, Hypothesis, Proposed behaviour, Non-goals, Success measures, Risks, Open questions and Smallest test.
6. End with the three assumptions that should be tested first.

GUARDRAILS
- Do not describe an unvalidated idea as a validated problem.
- If personal or confidential data is offered, ask for an anonymised version.
- Do not make legal, compliance or security approval decisions.
- If evidence is missing, label it clearly and ask for the next useful evidence.
- Stay within product discovery; do not claim that this prototype proves technical feasibility.

Acknowledge these rules in one sentence, then ask for the rough product idea.
```

#### Completion check

- [ ] The prototype asks one question at a time
- [ ] Facts and assumptions are separated
- [ ] It waits for confirmation before drafting
- [ ] Privacy and authority boundaries are respected
- [ ] The learner reruns a failed test after one change

### Sunday Practice: Adapt it yourself: create a different AI behaviour prototype

**Independent challenge:** Choose one behaviour to prototype: PRD critic, research-plan coach or experiment-design assistant. Adapt the behaviour contract rather than starting from a blank prompt.

#### Rules

- Write one learning question
- Define at least three states
- Add three prohibited behaviours
- Create five test conversations before running them
- State what the chat prototype cannot prove

#### Reflection

1. What was the riskiest assumption?
2. Which test exposed the biggest failure?
3. What instruction changed the behaviour most?
4. What would require code, data integration or organisational approval before production?

**Sunday success signal:** The learner makes meaningful changes without being given a replacement prompt. Optional hints are acceptable; copying the completed Saturday prompt unchanged is not.

---

## Appendix B: Final implementation report template

When implementation is complete, report:

- Summary of the completed end-to-end flow.
- Architecture and persistence decisions.
- Files and routes added or changed.
- Assessment routing examples verified.
- Tests, lint, type checks and builds run, with results.
- Visual checks performed and viewports used.
- Known limitations and deferred scope.
- Any manual migration or environment steps required.
