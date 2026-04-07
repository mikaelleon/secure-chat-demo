export type CaesarCharInfo = {
  input: string;
  output: string;
  shifted: boolean;
};

export function getCaesarCharMap(text: string, shift: number): CaesarCharInfo[] {
  const s = shift % 26;
  return [...text].map((char) => {
    if (/[a-z]/.test(char)) {
      const code = char.charCodeAt(0) - 97;
      const out = String.fromCharCode(((code + s) % 26) + 97);
      return { input: char, output: out, shifted: true };
    }
    if (/[A-Z]/.test(char)) {
      const code = char.charCodeAt(0) - 65;
      const out = String.fromCharCode(((code + s) % 26) + 65);
      return { input: char, output: out, shifted: true };
    }
    return { input: char, output: char, shifted: false };
  });
}

export function getUtf8Bytes(text: string): number[] {
  if (!text) return [];
  return [...new TextEncoder().encode(text)];
}

/** Visual groups of 4 chars (Base64 output padding-friendly). */
export function chunkBase64Display(encoded: string): string[] {
  if (!encoded) return [];
  const chunks: string[] = [];
  for (let i = 0; i < encoded.length; i += 4) {
    chunks.push(encoded.slice(i, i + 4));
  }
  return chunks;
}

export const VISUALIZER_MAX_CHARS = 72;

export function truncateForVisual(text: string, max = VISUALIZER_MAX_CHARS): string {
  if (text.length <= max) return text;
  return text.slice(0, max);
}
