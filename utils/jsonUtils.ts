/**
 * Utility functions for handling JSON data, specifically for cleaning and sanitizing
 * strings returned by LLMs that may contain Markdown formatting or conversational text.
 */

/**
 * Cleans a string to extract valid JSON content.
 *
 * It handles:
 * 1. Markdown code blocks (```json ... ```)
 * 2. Leading/trailing whitespace
 * 3. Text preambles/postscripts (extracts the first outer {} or [])
 *
 * @param input The raw string from the LLM.
 * @returns The cleaned JSON string.
 */
export const cleanJsonString = (input: string): string => {
  if (!input) return "";

  let cleaned = input.trim();

  // Remove markdown code blocks if present
  // Matches ```json, ```JSON, or just ``` at the start, and ``` at the end
  const codeBlockRegex = /^```(?:json|JSON)?\s*([\s\S]*?)\s*```$/;
  const match = cleaned.match(codeBlockRegex);
  if (match) {
    cleaned = match[1].trim();
  }

  // Attempt to find the first JSON object or array if the string is not just JSON
  // This helps when the LLM says "Here is the JSON: { ... }"
  const firstBrace = cleaned.indexOf('{');
  const firstBracket = cleaned.indexOf('[');

  let startIndex = -1;
  let endIndex = -1;

  // Determine if it looks like an object or array
  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    startIndex = firstBrace;
    endIndex = cleaned.lastIndexOf('}');
  } else if (firstBracket !== -1) {
    startIndex = firstBracket;
    endIndex = cleaned.lastIndexOf(']');
  }

  if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
    cleaned = cleaned.substring(startIndex, endIndex + 1);
  }

  return cleaned;
};
