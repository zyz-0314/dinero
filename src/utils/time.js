/**
 * 校验日期是否为有效日期
 * @param {string|Date} date 日期字符串(YYYY-MM-DD)或Date对象
 * @returns {boolean} 是否有效
 */
export const isValidDate = (date) => {
    //拦截空值、非字符串
    if(!date || typeof date != 'string') return false

    const targetDate = typeof date === 'string' ? new Date(date) : date
    if(isNaN(targetDate.getTime())) return false

    if(typeof date === 'string') {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/
        if(!dateRegex.test(date)) return false

        //检测字符串与Date对象的年月日一致
        const year = targetDate.getFullYear();
        const month = String(targetDate.getMonth()+1).padStart(2, '0')
        const day = String(targetDate.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}` === date
    }

    return true
}

/**
 * 获取今日日期（YYYY-MM-DD）
 * @returns {string} 今日日期
 */
export const getTodayDate = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth()+1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

/**
 * 日期是否超出范围，不能选未来日期
 * @param {string} date YYYY-MM-DD格式
 * @returns {boolean} 是否为未来日期
 */
export const isFutureDate = (date) => {
    if(!isValidDate(date)) return false

    const targetDate = new Date(date)
    const today = new Date(getTodayDate() )
    targetDate.setHours(0, 0, 0, 0)
    today.setHours(0, 0, 0, 0)

    return targetDate > today
}