function generateChatId() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  // Generate a random 3-letter prefix
  const prefix = Array.from(
    { length: 3 },
    () => letters[Math.floor(Math.random() * letters.length)],
  ).join('');

  // Generate a random 9-digit number
  const number = Math.floor(100000000 + Math.random() * 900000000);

  return `${prefix}${number}`;
}

export default generateChatId;
