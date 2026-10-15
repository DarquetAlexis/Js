# ALEX — Speak Naturally

Mobile-first Spanish-to-English speaking coach built for one learner. This is an **MVP**, not an AI conversation tutor yet.

## Included
- Onboarding, goal, interests, available study time and energy
- 30 short speaking prompts with English speech synthesis
- Voice recognition via the browser's SpeechRecognition API, when available
- Lexical matching of transcript with model phrase (not phoneme-level pronunciation scoring)
- Five-prompt oral quizzes, local progress history, expressions dictionary
- Adjustable daily study load, 16-week progression labels
- Browser-local storage, export and delete of learner profile
- Installable progressive web app manifest, cache for static assets

## Limitations
- No backend LLM or real-time freeform dialogue yet
- Browser speech recognition may require internet and may fail on iOS Safari; permissions and secure origin required
- Offline cache is for static UI only; voice functionality depends on browser/device support
- Practice prompts currently repeat; 16-week study progression is not a full curriculum yet
- The tests measure transcript overlap, not reliable fluency or true pronunciation
- Local browser data won't automatically sync across devices; do not store sensitive personal info

## Run
Serve the directory over localhost or HTTPS. For example: `python3 -m http.server 8000` in `alex-speak/`. Open http://localhost:8000 on a supported desktop browser; publish via any static site host for mobile HTTPS.

## Privacy and production roadmap
Keep the repository's lesson data generic; never commit personal transcripts or tokens. Next version needs a proper server-side API for streaming speech-to-speech conversations, encrypted storage, opt-in transcripts, dedicated weekly evaluations, spaced repetition, and a consent-controlled personalization model.
