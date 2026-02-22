export function slugify(text: string) {
  return text.toLowerCase().replace(/ /g, "-");
}

export function generateRandomString(length: number) {
  return Math.random()
    .toString(36)
    .substring(2, 2 + length);
}
