const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateGroupCode(length = 7): string {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return code;
}
