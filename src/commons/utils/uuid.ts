// Function written by ChatGTP, it is good enough
export function randomUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8; // El 4 y el 8-B se usan en UUIDv4
    return v.toString(16);
  });
}
