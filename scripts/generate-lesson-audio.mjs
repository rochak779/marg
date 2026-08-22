// One-time batch job: turns a module's lesson text into narrated mp3s via
// ElevenLabs, stored as static files under public/audio/lessons/. Not part
// of the running app — run manually whenever lesson copy changes.
//
// Usage: node scripts/generate-lesson-audio.mjs [moduleId]
// Requires ELEVENLABS_API_KEY in .env.local.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.dirname(fileURLToPath(import.meta.url)) + '/..';

function loadEnvLocal() {
  const envPath = path.join(rootDir, '.env.local');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    const value = rawValue.replace(/^["']|["']$/g, '');
    if (!(key in process.env)) process.env[key] = value;
  }
}
loadEnvLocal();

const API_KEY = process.env.ELEVENLABS_API_KEY;
if (!API_KEY) {
  console.error('Missing ELEVENLABS_API_KEY in .env.local');
  process.exit(1);
}

// Default premade ElevenLabs voice ("Rachel"). Swap if you pick a different one.
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM';
const MODEL_ID = 'eleven_turbo_v2_5';

const targetModuleId = Number(process.argv[2] || 1);

const curriculum = JSON.parse(
  fs.readFileSync(path.join(rootDir, 'content/curriculum.generated.json'), 'utf8'),
);

const targetModule = curriculum.find((m) => m.id === targetModuleId);
if (!targetModule) {
  console.error(`No module with id ${targetModuleId}`);
  process.exit(1);
}

const lessonUnits = targetModule.units.filter((u) => u.kind === 'lesson');

const outDir = path.join(rootDir, 'public/audio/lessons');
fs.mkdirSync(outDir, { recursive: true });

const manifestPath = path.join(outDir, 'manifest.json');
const manifest = fs.existsSync(manifestPath)
  ? JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  : {};

function scriptFor(unit) {
  return [unit.hook, ...unit.theory, `For example: ${unit.example}`].join(
    '\n\n',
  );
}

async function synthesize(text) {
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': API_KEY,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        model_id: MODEL_ID,
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
    },
  );
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`ElevenLabs ${res.status}: ${body}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

for (const unit of lessonUnits) {
  console.log(`Generating audio for ${unit.id}...`);
  const audio = await synthesize(scriptFor(unit));
  const filePath = path.join(outDir, `${unit.id}.mp3`);
  fs.writeFileSync(filePath, audio);
  manifest[unit.id] = `/audio/lessons/${unit.id}.mp3`;
  console.log(`  -> ${filePath} (${(audio.length / 1024).toFixed(0)} KB)`);
}

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
console.log(`\nDone. Manifest: ${manifestPath}`);
