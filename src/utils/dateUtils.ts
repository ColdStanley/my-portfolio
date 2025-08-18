import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

// 扩展dayjs插件
dayjs.extend(utc)
dayjs.extend(timezone)

// 用户默认时区 - Toronto
const USER_TIMEZONE = 'America/Toronto'

/**
 * 将UTC时间转换为用户本地时间显示格式
 * @param utcTime UTC时间字符串 "2025-08-18T13:00:00Z"
 * @returns 本地时间显示 "08-18 09:00"
 */
export const formatDisplayTime = (utcTime: string): string => {
  if (!utcTime) return ''
  return dayjs.utc(utcTime).tz(USER_TIMEZONE).format('MM-DD HH:mm')
}

/**
 * 提取时间部分用于显示
 * @param utcTime UTC时间字符串 "2025-08-18T13:00:00Z" 
 * @returns 时间部分 "09:00"
 */
export const extractTimeOnly = (utcTime: string): string => {
  if (!utcTime) return ''
  return dayjs.utc(utcTime).tz(USER_TIMEZONE).format('HH:mm')
}

/**
 * 提取日期部分用于显示
 * @param utcTime UTC时间字符串 "2025-08-18T13:00:00Z"
 * @returns 日期部分 "2025-08-18"
 */
export const extractDateOnly = (utcTime: string): string => {
  if (!utcTime) return ''
  return dayjs.utc(utcTime).tz(USER_TIMEZONE).format('YYYY-MM-DD')
}

/**
 * 将UTC时间转换为datetime-local输入格式
 * @param utcTime UTC时间字符串 "2025-08-18T13:00:00Z"
 * @returns datetime-local格式 "2025-08-18T09:00"
 */
export const toDatetimeLocal = (utcTime: string): string => {
  if (!utcTime) return ''
  return dayjs.utc(utcTime).tz(USER_TIMEZONE).format('YYYY-MM-DDTHH:mm')
}

/**
 * 将本地datetime-local输入转换为UTC存储格式
 * @param localTime 本地时间 "2025-08-18T09:00"
 * @returns UTC ISO字符串 "2025-08-18T13:00:00.000Z"
 */
export const toUTC = (localTime: string): string => {
  if (!localTime) return ''
  return dayjs.tz(localTime, USER_TIMEZONE).utc().toISOString()
}

/**
 * 获取当前Toronto时间的datetime-local格式
 * @returns 当前本地时间 "2025-08-18T09:30"
 */
export const getCurrentLocalTime = (): string => {
  return dayjs().tz(USER_TIMEZONE).format('YYYY-MM-DDTHH:mm')
}

/**
 * 获取当前UTC时间
 * @returns 当前UTC时间 "2025-08-18T13:30:00.000Z"
 */
export const getCurrentUTC = (): string => {
  return dayjs().utc().toISOString()
}

/**
 * 获取下一个整点的本地时间（智能默认开始时间）
 * @returns 下一个整点时间 "2025-08-18T15:00"
 */
export const getDefaultStartTime = (): string => {
  return dayjs().tz(USER_TIMEZONE).add(1, 'hour').startOf('hour').format('YYYY-MM-DDTHH:mm')
}

/**
 * 获取默认结束时间（开始时间+1小时）
 * @returns 默认结束时间 "2025-08-18T16:00"
 */
export const getDefaultEndTime = (): string => {
  return dayjs().tz(USER_TIMEZONE).add(2, 'hour').startOf('hour').format('YYYY-MM-DDTHH:mm')
}

/**
 * 格式化日期显示名称
 * @param dateString 日期字符串 "2025-08-18"
 * @returns 格式化的日期显示 "Sunday, August 18"
 */
export const formatDateDisplayName = (dateString: string): string => {
  if (!dateString) return ''
  return dayjs(dateString).tz(USER_TIMEZONE).format('dddd, MMMM D')
}

/**
 * 获取今天的日期
 * @returns 今天的日期 "2025-08-18"
 */
export const getTodayDate = (): string => {
  return dayjs().tz(USER_TIMEZONE).format('YYYY-MM-DD')
}

/**
 * 提取时间部分并格式化为12小时制
 * @param utcTime UTC时间字符串 "2025-08-18T13:00:00Z"
 * @returns 12小时制时间 "9:00 AM"
 */
export const extractTime12Hour = (utcTime: string): string => {
  if (!utcTime) return ''
  return dayjs.utc(utcTime).tz(USER_TIMEZONE).format('h:mm A')
}