# Claude Code Guidelines for Multi-Lingua

## Translation Provider Architecture

**IMPORTANT: NEVER implement or speak of a "fallback strategy" for translation providers.**

This application uses ONE translation provider at a time. The user selects a single provider via radio buttons in Settings. That provider is used for all translations. Period.

- No fallback order
- No trying multiple providers
- No provider priority lists
- One provider enabled = one provider used
