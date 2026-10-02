import {
  CHARACTERS_LETTERS,
  CHARACTERS_NUMBERS,
  CHARACTERS_SPECIAL,
  METHODS,
} from "./constants.js";

const generateRandomString = (
  length,
  includeNumbers = false,
  includeSpecialChars = false,
) => {
  // 1. Default: always include uppercase and lowercase letters
  let characters = CHARACTERS_LETTERS;

  // 2. If numbers are needed, add numbers
  if (includeNumbers) {
    characters += CHARACTERS_NUMBERS;
  }

  // 3. If special characters are needed, add special characters
  if (includeSpecialChars) {
    characters += CHARACTERS_SPECIAL;
  }

  // 4. Generate random string with the specified length
  let result = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }

  return result;
};

const generateRandomEmail = (
  isValid = false,
  hasSubdomain = false,
  length = 10,
) => {
  // 1. Auto random length from 1 to length
  const randomLength = Math.floor(Math.random() * length) + 1;

  // 2. Generate prefix contains numbers and special characters
  const prefix = generateRandomString(randomLength, true, false);

  if (isValid) {
    // 2. Domain and Extension only contain letters
    const domainLength = Math.floor(Math.random() * 5) + 4; // 4-8 characters
    const extLength = Math.floor(Math.random() * 3) + 2; // 2-4 characters

    const randomDomain = generateRandomString(domainLength, false, false);
    const randomExtension = generateRandomString(extLength, false, false);

    if (hasSubdomain) {
      const subLength = Math.floor(Math.random() * 3) + 2; // 2-4 characters
      const randomSubdomain = generateRandomString(subLength, false, false);

      return `${prefix}@${randomSubdomain}.${randomDomain}.${randomExtension}`;
    }

    return `${prefix}@${randomDomain}.${randomExtension}`;

    // return `${prefix}@gmail.com`;

  }

  return prefix;
};

const generateOtherMethodNotChoose = (method = METHODS.GET) => {
  const ALL_METHODS = Object.values(METHODS);
  return ALL_METHODS.filter((m) => m !== method);
};

export {
  generateRandomString,
  generateRandomEmail,
  generateOtherMethodNotChoose,
};
