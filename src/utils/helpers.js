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

const generateRandomNumber = (min = 1, max = 1000) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
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

/**
 * =========================================================================
 * DYNAMIC DATE HELPERS (Triệt tiêu hardcode ngày tháng trong automation)
 * =========================================================================
 */

/**
 * Format một đối tượng Date sang chuỗi theo định dạng
 * @param {Date} date
 * @param {'YYYY-MM-DD' | 'YYYY/MM/DD' | 'YYYY-MM-DD HH:mm:ss' | 'ISO'} format
 * @returns {string}
 */
const formatDate = (date = new Date(), format = "YYYY-MM-DD") => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const seconds = String(d.getSeconds()).padStart(2, "0");

  switch (format) {
    case "YYYY/MM/DD":
      return `${year}/${month}/${day}`;
    case "YYYY-MM-DD HH:mm:ss":
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    case "ISO":
      return d.toISOString();
    case "YYYY-MM-DD":
    default:
      return `${year}-${month}-${day}`;
  }
};

/**
 * Lấy ngày hôm nay theo format chỉ định
 */
const getToday = (format = "YYYY-MM-DD") => {
  return formatDate(new Date(), format);
};

/**
 * Lấy ngày trong tương lai (cộng thêm days ngày tính từ hôm nay)
 */
const getFutureDate = (days = 1, format = "YYYY-MM-DD") => {
  const d = new Date();
  d.setDate(d.getDate() + Number(days));
  return formatDate(d, format);
};

/**
 * Lấy ngày trong quá khứ (trừ đi days ngày tính từ hôm nay)
 */
const getPastDate = (days = 1, format = "YYYY-MM-DD") => {
  const d = new Date();
  d.setDate(d.getDate() - Number(days));
  return formatDate(d, format);
};

/**
 * Tạo khoảng ngày động (Start Date & End Date) cho filter/search
 * @param {number} startOffsetDays Số ngày lệch của ngày bắt đầu (VD: -7 là 7 ngày trước)
 * @param {number} endOffsetDays Số ngày lệch của ngày kết thúc (VD: 0 là hôm nay, 30 là 30 ngày sau)
 * @param {string} format
 */
const getDateRange = (startOffsetDays = -7, endOffsetDays = 0, format = "YYYY-MM-DD") => {
  return {
    startDate: startOffsetDays >= 0 ? getFutureDate(startOffsetDays, format) : getPastDate(Math.abs(startOffsetDays), format),
    endDate: endOffsetDays >= 0 ? getFutureDate(endOffsetDays, format) : getPastDate(Math.abs(endOffsetDays), format),
  };
};

export {
  generateRandomString,
  generateRandomNumber,
  generateRandomEmail,
  generateOtherMethodNotChoose,
  formatDate,
  getToday,
  getFutureDate,
  getPastDate,
  getDateRange,
};
