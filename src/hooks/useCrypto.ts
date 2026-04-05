import { useCallback } from "react";

export type EncryptionMode = "symmetric" | "asymmetric";

function caesarEncrypt(text: string, shift: number): string {
  return text
    .split("")
    .map((char) => {
      if (char.match(/[a-z]/)) {
        return String.fromCharCode(((char.charCodeAt(0) - 97 + shift) % 26) + 97);
      }
      if (char.match(/[A-Z]/)) {
        return String.fromCharCode(((char.charCodeAt(0) - 65 + shift) % 26) + 65);
      }
      return char;
    })
    .join("");
}

function caesarDecrypt(text: string, shift: number): string {
  return caesarEncrypt(text, 26 - (shift % 26));
}

function base64Encode(text: string): string {
  try {
    return btoa(unescape(encodeURIComponent(text)));
  } catch {
    return btoa(text);
  }
}

function base64Decode(text: string): string {
  try {
    return decodeURIComponent(escape(atob(text)));
  } catch {
    try {
      return atob(text);
    } catch {
      return text;
    }
  }
}

export function useCrypto() {
  const encrypt = useCallback(
    (text: string, mode: EncryptionMode, shift: number = 3): string => {
      if (!text) return "";
      if (mode === "symmetric") {
        return caesarEncrypt(text, shift);
      }
      return base64Encode(text);
    },
    []
  );

  const decrypt = useCallback(
    (encrypted: string, mode: EncryptionMode, shift: number = 3): string => {
      if (!encrypted) return "";
      if (mode === "symmetric") {
        return caesarDecrypt(encrypted, shift);
      }
      return base64Decode(encrypted);
    },
    []
  );

  return { encrypt, decrypt };
}
