import fs from 'node:fs';

const source = fs.readFileSync(
  'CODEX_END_TO_END_IMPLEMENTATION_BRIEF.md',
  'utf8',
);
const appendix = source.slice(source.indexOf('## Module 1:'));
const chunks = appendix
  .split(/(?=^## Module \d+:)/m)
  .filter((part) => /^## Module \d+:/.test(part));
const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const clean = (value = '') =>
  value
    .trim()
    .replace(/^\*\*[^:]+:\*\*\s*/, '')
    .trim();
const between = (text, start, end) => {
  const from = text.indexOf(start);
  if (from < 0) return '';
  const rest = text.slice(from + start.length);
  const to = end ? rest.search(end) : -1;
  return (to < 0 ? rest : rest.slice(0, to)).trim();
};
const bullets = (text) =>
  text
    .split('\n')
    .map((line) =>
      line
        .match(/^\s*(?:\d+\.|- \[ \]|-)\s+(?:\*\*[^*]+\*\*\s*)?(.*)$/)?.[1]
        ?.trim(),
    )
    .filter(Boolean);
const paragraphs = (text) =>
  text
    .split(/\n\n+/)
    .map((part) => part.trim().replace(/\n/g, ' '))
    .filter(Boolean);
const quiz = (text, moduleId, day) =>
  between(text, '#### Three-question check', /(?=^### |^---)/m)
    .split(/(?=^\d+\. \*\*)/m)
    .filter((block) => /^\d+\. \*\*/.test(block.trim()))
    .map((block, index) => {
      const correct =
        block.match(/\*\*Correct option:\*\* ([A-D])/i)?.[1] ?? 'A';
      return {
        id: `m${moduleId}-${day}-q${index + 1}`,
        prompt: block.match(/^\d+\. \*\*(.*?)\*\*/m)?.[1] ?? '',
        options: [...block.matchAll(/^\s+- [A-D]\. (.*)$/gm)].map((match) =>
          match[1].trim(),
        ),
        correctIndex: correct.charCodeAt(0) - 65,
        explanation:
          block.match(/\*\*Explanation:\*\* (.*)/i)?.[1]?.trim() ?? '',
      };
    });
const modules = chunks.map((chunk) => {
  const [, idText, title] = chunk.match(/^## Module (\d+): (.*)$/m);
  const id = Number(idText);
  const header = chunk.slice(0, chunk.search(/^### /m));
  const units = chunk
    .split(/(?=^### )/m)
    .slice(1)
    .map((section) => {
      const heading = section.match(/^### (.*)$/m)?.[1] ?? '';
      if (heading.startsWith('Saturday Build:')) {
        const estimate = clean(
          section.match(/\*\*Estimated time:\*\* (.*)/)?.[1],
        );
        const nums = [...estimate.matchAll(/\d+/g)].map((m) => Number(m[0]));
        return {
          id: `module-${id}-saturday`,
          day: 'saturday',
          kind: 'build',
          title: heading.replace('Saturday Build: ', ''),
          outcome: clean(section.match(/\*\*Outcome:\*\* (.*)/)?.[1]),
          estimate,
          estimatedMinutes:
            nums.length > 1
              ? Math.round((nums[0] + nums[1]) / 2)
              : nums[0] || 35,
          practiceInput: between(
            section,
            '#### Practice input',
            /(?=^#### Step-by-step instructions)/m,
          )
            .replace(/^```text\n|\n```$/g, '')
            .trim(),
          steps: bullets(
            between(
              section,
              '#### Step-by-step instructions',
              /(?=^#### Prompt to use)/m,
            ),
          ),
          prompt: between(
            section,
            '#### Prompt to use',
            /(?=^#### Completion check)/m,
          )
            .replace(/^```text\n|\n```$/g, '')
            .trim(),
          checks: bullets(
            between(section, '#### Completion check', /(?=^### |^---)/m),
          ),
        };
      }
      if (heading.startsWith('Sunday Practice:')) {
        const rules = bullets(
          between(section, '#### Rules', /(?=^#### Reflection)/m),
        );
        return {
          id: `module-${id}-sunday`,
          day: 'sunday',
          kind: 'practice',
          title: heading.replace('Sunday Practice: ', ''),
          challenge: clean(
            section.match(/\*\*Independent challenge:\*\* (.*)/)?.[1],
          ),
          rules,
          reflections: bullets(
            between(
              section,
              '#### Reflection',
              /(?=^\*\*Sunday success signal)/m,
            ),
          ),
          hints: rules
            .slice(0, 3)
            .map((rule) => `Try adapting this requirement: ${rule}`),
          estimatedMinutes: 15,
        };
      }
      const day = weekdays.find((name) => heading.startsWith(`${name}:`));
      if (!day) return null;
      const slug = day.toLowerCase();
      const parts = paragraphs(
        between(section, '#### Theory', /(?=^#### Three-question check)/m),
      );
      const field = (label) =>
        clean(parts.find((part) => part.startsWith(`**${label}:**`)) ?? '');
      return {
        id: `module-${id}-${slug}`,
        day: slug,
        kind: 'lesson',
        title: heading.replace(`${day}: `, ''),
        hook: clean(section.match(/\*\*Hook:\*\* (.*)/)?.[1]),
        theory: parts.filter(
          (part) =>
            !/^\*\*(Example|Do this now|Keep for Saturday):\*\*/.test(part),
        ),
        example: field('Example'),
        action: field('Do this now'),
        savedComponent: field('Keep for Saturday'),
        estimatedMinutes: 10,
        quiz: quiz(section, id, slug),
      };
    })
    .filter(Boolean);
  return {
    id,
    slug: `module-${id}`,
    title,
    audience: clean(header.match(/\*\*Audience:\*\* (.*)/)?.[1]),
    outcome: clean(header.match(/\*\*End-of-week capability:\*\* (.*)/)?.[1]),
    weekdayComponents: bullets(
      between(header, '**Weekday build components:**'),
    ),
    units,
  };
});
fs.mkdirSync('content', { recursive: true });
fs.writeFileSync(
  'content/curriculum.generated.json',
  `${JSON.stringify(modules, null, 2)}\n`,
);
console.log(
  `Generated ${modules.length} modules and ${modules.reduce((sum, module) => sum + module.units.length, 0)} units.`,
);
