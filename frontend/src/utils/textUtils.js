// Utility functions for text processing

/**
 * Strip HTML tags from content and return plain text
 * @param {string} html - HTML content
 * @returns {string} - Plain text without HTML tags
 */
export const stripHtmlTags = (html) => {
  if (!html || typeof html !== 'string') return '';
  
  // Remove HTML tags
  let text = html.replace(/<[^>]*>/g, '');
  
  // Decode common HTML entities
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#x27;/g, "'");
  text = text.replace(/&nbsp;/g, ' ');
  
  // Clean up extra whitespace
  text = text.replace(/\s+/g, ' ').trim();
  
  return text;
};

/**
 * Truncate text to a specific length with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated text with ellipsis if needed
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || typeof text !== 'string') return '';
  
  const cleanText = stripHtmlTags(text);
  
  if (cleanText.length <= maxLength) return cleanText;
  
  return cleanText.substring(0, maxLength).trim() + '...';
};

/**
 * Get reading time estimate in minutes
 * @param {string} content - Text content
 * @returns {number} - Estimated reading time in minutes
 */
export const getReadingTime = (content) => {
  if (!content || typeof content !== 'string') return 0;
  
  const cleanText = stripHtmlTags(content);
  const words = cleanText.split(/\s+/).filter(word => word.length > 0);
  const wordsPerMinute = 200; // Average reading speed
  
  return Math.max(1, Math.ceil(words.length / wordsPerMinute));
};

/**
 * Get word count from content
 * @param {string} content - Text content
 * @returns {number} - Word count
 */
export const getWordCount = (content) => {
  if (!content || typeof content !== 'string') return 0;
  
  const cleanText = stripHtmlTags(content);
  return cleanText.split(/\s+/).filter(word => word.length > 0).length;
};
