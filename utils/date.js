// utils/data.js

/**
 * 将 ISO 时间字符串转换为 'yyyy-MM-dd' 格式
 * @param {string} dateStr - ISO 格式日期字符串
 * @returns {string} 格式化后的日期
 */
export function formatDate(dateStr) {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 如果你还想导出其他工具函数，可以继续添加导出
