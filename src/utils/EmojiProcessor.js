/**
 * EmojiProcessor.js
 * Utility to process emoji shortcodes using JoyPixels.
 */
import joypixels from 'emoji-toolkit';

/**
 * Processes emojis on specific UI elements.
 * JoyPixels npm package expects a string, unlike some CDN versions that take a Document object.
 */
export const processEmojis = () => {
  const elements = document.querySelectorAll('.task-text, .note-content');
  elements.forEach((el) => {
    // Only process if it contains shortcodes
    if (el.textContent.includes(':')) {
      el.innerHTML = joypixels.shortnameToImage(el.innerHTML);
    }
  });
};

/**
 * Processes a string and returns it with emoji images.
 */
export const parseTextEmojis = (text) => {
  if (typeof text !== 'string') return text;
  return joypixels.shortnameToImage(text);
};

export const attachEmojiHandlers = () => {
  // Can be used for dynamic handlers
};
