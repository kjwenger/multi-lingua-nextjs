#!/usr/bin/env bash
# Run integration tests for translation providers.
# Tests are skipped (with a warning) when required env vars are not set.
#
# Usage:
#   ./scripts/test-providers.sh              # run all providers whose keys are set
#   ./scripts/test-providers.sh pons deepl   # run specific providers only
#
# Environment variables:
#   PONS_API_SECRET          — PONS Dictionary
#   DEEPL_API_KEY            — DeepL
#   GOOGLE_API_KEY           — Google Translate
#   AZURE_API_KEY            — Azure Translator (also needs AZURE_REGION)
#   AZURE_REGION             — Azure Translator region (default: global)
#   LIBRETRANSLATE_URL       — LibreTranslate instance URL
#   LIBRETRANSLATE_API_KEY   — LibreTranslate API key (optional)
#   MYMEMORY_EMAIL           — MyMemory (optional, increases quota)
#   MERRIAM_WEBSTER_API_KEY  — Merriam-Webster Dictionary
#   OXFORD_APP_ID            — Oxford Dictionary
#   OXFORD_APP_KEY           — Oxford Dictionary

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
TEST_DIR="$REPO_DIR/__tests__/translation-providers"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
RESET='\033[0m'

skipped=()
passed=()
failed=()

run_test() {
  local name="$1"
  local file="$2"
  shift 2
  # remaining args are required env var names
  local missing=()
  for var in "$@"; do
    if [[ -z "${!var:-}" ]]; then
      missing+=("$var")
    fi
  done

  if [[ ${#missing[@]} -gt 0 ]]; then
    echo -e "${YELLOW}SKIP${RESET}  $name  (missing: ${missing[*]})"
    skipped+=("$name")
    return
  fi

  echo -e "\n${GREEN}RUN${RESET}   $name"
  if npx jest --testPathPattern="$file" --no-coverage 2>&1; then
    passed+=("$name")
  else
    failed+=("$name")
  fi
}

cd "$REPO_DIR"

# Determine which providers to run (all by default, or subset from args)
providers=("${@:-pons deepl google azure libretranslate mymemory merriam-webster oxford free-dictionary tatoeba}")
if [[ $# -gt 0 ]]; then
  providers=("$@")
else
  # word-split the default string into an array
  read -ra providers <<< "pons deepl google azure libretranslate mymemory merriam-webster oxford free-dictionary tatoeba"
fi

for provider in "${providers[@]}"; do
  case "$provider" in
    pons)
      run_test "PONS" "$TEST_DIR/pons.test.ts" PONS_API_SECRET ;;
    deepl)
      run_test "DeepL" "$TEST_DIR/deepl.test.ts" DEEPL_API_KEY ;;
    google)
      run_test "Google Translate" "$TEST_DIR/google.test.ts" GOOGLE_API_KEY ;;
    azure)
      run_test "Azure Translator" "$TEST_DIR/azure.test.ts" AZURE_API_KEY AZURE_REGION ;;
    libretranslate)
      run_test "LibreTranslate" "$TEST_DIR/libretranslate.test.ts" LIBRETRANSLATE_URL ;;
    mymemory)
      run_test "MyMemory" "$TEST_DIR/mymemory.test.ts" ;;   # no required vars
    merriam-webster)
      run_test "Merriam-Webster" "$TEST_DIR/merriam-webster.test.ts" MERRIAM_WEBSTER_API_KEY ;;
    oxford)
      run_test "Oxford Dictionary" "$TEST_DIR/oxford.test.ts" OXFORD_APP_ID OXFORD_APP_KEY ;;
    free-dictionary)
      run_test "Free Dictionary" "$TEST_DIR/free-dictionary.test.ts" ;;  # no required vars
    tatoeba)
      run_test "Tatoeba" "$TEST_DIR/tatoeba.test.ts" ;;  # no required vars
    *)
      echo -e "${RED}Unknown provider: $provider${RESET}" >&2
      echo "Valid providers: pons deepl google azure libretranslate mymemory merriam-webster oxford free-dictionary tatoeba" >&2
      exit 1 ;;
  esac
done

# Summary
echo ""
echo "────────────────────────────────────────"
echo " Results"
echo "────────────────────────────────────────"
[[ ${#passed[@]}  -gt 0 ]] && echo -e "${GREEN}Passed${RESET}:  ${passed[*]}"
[[ ${#skipped[@]} -gt 0 ]] && echo -e "${YELLOW}Skipped${RESET}: ${skipped[*]}"
[[ ${#failed[@]}  -gt 0 ]] && echo -e "${RED}Failed${RESET}:  ${failed[*]}"
echo "────────────────────────────────────────"

[[ ${#failed[@]} -eq 0 ]]
