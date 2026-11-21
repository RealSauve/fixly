export function toSlug(value) {
  return String(value).toLowerCase().replace(/\s+/g, '-')
}
