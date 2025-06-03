/**
 * Formats a date in Russian to display how long ago it was created
 * @param dateString The date string to format
 * @returns A string representation of how long ago the date was, in Russian
 */
export const formatDateInRussian = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return 'Сегодня';
  } else if (diffDays === 1) {
    return 'Вчера';
  } else if (diffDays < 7) {
    return `${diffDays} ${getDayEnding(diffDays)} назад`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} ${getWeekEnding(weeks)} назад`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} ${getMonthEnding(months)} назад`;
  } else {
    const years = Math.floor(diffDays / 365);
    return `${years} ${getYearEnding(years)} назад`;
  }
};

/**
 * Standard date formatting function
 * @param dateString The date string to format
 * @returns A formatted date string
 */
export const formatDate = (dateString: string): string => {
  return formatDateInRussian(dateString);
};

/**
 * Gets the correct ending for days in Russian
 */
const getDayEnding = (days: number): string => {
  if (days === 1) return 'день';
  if (days >= 2 && days <= 4) return 'дня';
  return 'дней';
};

/**
 * Gets the correct ending for weeks in Russian
 */
const getWeekEnding = (weeks: number): string => {
  if (weeks === 1) return 'неделя';
  if (weeks >= 2 && weeks <= 4) return 'недели';
  return 'недель';
};

/**
 * Gets the correct ending for months in Russian
 */
const getMonthEnding = (months: number): string => {
  if (months === 1) return 'месяц';
  if (months >= 2 && months <= 4) return 'месяца';
  return 'месяцев';
};

/**
 * Gets the correct ending for years in Russian
 */
const getYearEnding = (years: number): string => {
  if (years === 1) return 'год';
  if (years >= 2 && years <= 4) return 'года';
  return 'лет';
};

/**
 * Formats a date in the standard Russian format
 */
export const formatFullDateInRussian = (dateString: string): string => {
  const date = new Date(dateString);
  
  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();
  
  const months = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
  ];
  
  return `${day} ${months[month]} ${year}`;
};
