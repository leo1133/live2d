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
  let characters = CHARACTERS_LETTERS;

  if (includeNumbers) {
    characters += CHARACTERS_NUMBERS;
  }

  if (includeSpecialChars) {
    characters += CHARACTERS_SPECIAL;
  }

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
  const randomLength = Math.floor(Math.random() * length) + 1;

  const prefix = generateRandomString(randomLength, true, false);

  if (isValid) {
    const domainLength = Math.floor(Math.random() * 5) + 4;
    const extLength = Math.floor(Math.random() * 3) + 2;

    const randomDomain = generateRandomString(domainLength, false, false);
    const randomExtension = generateRandomString(extLength, false, false);

    if (hasSubdomain) {
      const subLength = Math.floor(Math.random() * 3) + 2;
      const randomSubdomain = generateRandomString(subLength, false, false);

      return `${prefix}@${randomSubdomain}.${randomDomain}.${randomExtension}`;
    }

    return `${prefix}@${randomDomain}.${randomExtension}`;


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
