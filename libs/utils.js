/**
 * Converts a string to a URL-friendly slug
 * @param {string} text - The text to convert to a slug
 * @returns {string} The slugified text
 */
export function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')       // Replace spaces with -
    .replace(/&/g, '-and-')     // Replace & with 'and'
    .replace(/[^\w\-]+/g, '')   // Remove all non-word characters
    .replace(/\-\-+/g, '-');    // Replace multiple - with single -
}

/**
 * Extracts the exam ID from a slug in the format "id-name"
 * @param {string} slug - The slug containing ID and name
 * @returns {string} The extracted ID
 */
export function getIdFromSlug(slug) {
  if (!slug) return null;
  const parts = slug.split('-');
  return parts[0];
}

/**
 * Creates a slug from an exam ID and name
 * @param {string|number} id - The exam ID
 * @param {string} name - The exam name
 * @returns {string} The combined slug
 */
export function createExamSlug(id, name) {
  return `${id}-${slugify(name)}`;
} 