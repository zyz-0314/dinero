<template>
    <div class="bill-detail-container">
        <div class="bill-detail-header">
            <button class="back-btn" @click="handleBack">返回</button>
            <h1>账单详情</h1>
        </div>
        
        <div class="bill-detail-content">
            <div class="bill-tabs">
                <div class="bill-tab-buttons">
                    <div class="bill-tab" :class="{ active: billTab === 'monthly' }" @click="billTab = 'monthly'">月账单</div>
                    <div class="bill-tab" :class="{ active: billTab === 'yearly' }" @click="billTab = 'yearly'">年账单</div>
                </div>
            </div>
            
            <!-- 月账单内容 -->
            <div v-if="billTab === 'monthly'">
                <!-- 年结余卡片 -->
                <div class="yearly-balance-card">
                    <div class="yearly-balance-title">年结余</div>
                    <div class="yearly-balance-amount">{{ yearlyBalance.toFixed(2) }}</div>
                    <div class="yearly-income-expense">
                        <span>年收入 {{ yearlyIncome.toFixed(2) }}</span>
                        <span>年支出 {{ yearlyExpense.toFixed(2) }}</span>
                    </div>
                </div>
                
                <!-- 月份列表 -->
                <div class="monthly-list">
                    <div class="monthly-list-header">
                        <span>月份</span>
                        <span>月收入</span>
                        <span>月支出</span>
                        <span>月结余</span>
                    </div>
                    <div class="monthly-list-content">
                        <div v-for="(monthData, index) in monthlyDataList" :key="index" class="monthly-item">
                            <span>{{ monthData.year }}年{{ monthData.month }}月</span>
                            <span>{{ monthData.income.toFixed(2) }}</span>
                            <span>{{ monthData.expense.toFixed(2) }}</span>
                            <span>{{ monthData.balance.toFixed(2) }}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- 年账单内容 -->
            <div v-if="billTab === 'yearly'">
                <!-- 总结余卡片 -->
                <div class="yearly-balance-card">
                    <div class="yearly-balance-title">总结余</div>
                    <div class="yearly-balance-amount">{{ totalBalance.toFixed(2) }}</div>
                    <div class="yearly-income-expense">
                        <span>总收入 {{ totalIncome.toFixed(2) }}</span>
                        <span>总支出 {{ totalExpense.toFixed(2) }}</span>
                    </div>
                </div>
                
                <!-- 年份列表 -->
                <div class="yearly-list">
                    <div class="yearly-list-header">
                        <span>年份</span>
                        <span>年收入</span>
                        <span>年支出</span>
                        <span>年结余</span>
                    </div>
                    <div class="yearly-list-content">
                        <div v-for="(yearData, index) in yearlyDataList" :key="index" class="yearly-item">
                            <span>{{ yearData.year }}年</span>
                            <span>{{ yearData.income.toFixed(2) }}</span>
                            <span>{{ yearData.expense.toFixed(2) }}</span>
                            <span>{{ yearData.balance.toFixed(2) }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import router from '@/router';

export default {
    name: 'BillDetail',
    data() {
        return {
            currentYear: new Date().getFullYear(),
            billTab: 'monthly',
            records: [],
            yearlyIncome: 0,
            yearlyExpense: 0,
            yearlyBalance: 0,
            monthlyDataList: [],
            totalBalance: 0,
            totalIncome: 0,
            totalExpense: 0,
            yearlyDataList: []
        }
    },
    created() {
        this.loadRecords();
    },
    methods: {
        handleBack() {
            router.push({ name: 'MoneyManagement' });
        },
        loadRecords() {
            // 加载硬编码数据（2025年5月到2026年2月）和实时计算数据（2026年3月及以后）
            this.loadCombinedData();
        },
        loadCombinedData() {
            // 硬编码的月度账单数据（2025年5月到2026年2月）
            const hardcodedMonthlyData = [
                // 2026年
                { year: 2026, month: 2, income: 4817.08, expense: 527.97, balance: 4289.11 },
                { year: 2026, month: 1, income: 2020.00, expense: 1737.65, balance: 282.35 },
                // 2025年
                { year: 2025, month: 12, income: 2429.03, expense: 1814.75, balance: 614.28 },
                { year: 2025, month: 11, income: 2437.54, expense: 2770.91, balance: -333.37 },
                { year: 2025, month: 10, income: 2571.25, expense: 11317.28, balance: -8746.03 },
                { year: 2025, month: 9, income: 3061.51, expense: 1568.63, balance: 1492.88 },
                { year: 2025, month: 8, income: 5007.04, expense: 387.70, balance: 4619.34 },
                { year: 2025, month: 7, income: 3121.60, expense: 1363.56, balance: 1758.04 },
                { year: 2025, month: 6, income: 2307.00, expense: 1666.88, balance: 640.12 },
                { year: 2025, month: 5, income: 2260.00, expense: 3628.45, balance: -1368.45 }
            ];
            
            // 硬编码的2025年年度数据
            const hardcodedYearlyData = [
                { year: 2025, income: 23194.97, expense: 24518.16, balance: -1323.19 }
            ];
            
            // 从本地存储读取记录，计算2026年3月及以后的实时数据
            const storedRecords = localStorage.getItem('recordDetailList');
            let realtimeMonthlyData = [];
            let realtimeYearlyData = { year: 2026, income: 0, expense: 0, balance: 0 };
            
            if (storedRecords) {
                this.records = JSON.parse(storedRecords);
                
                // 初始化月度数据对象（用于2026年3月及以后）
                const monthlyDataMap = {};
                
                // 遍历记录，过滤出有效数据
                const validRecords = this.records.filter(record => {
                    return this.isValidDate(record.date) && !isNaN(Number(record.amount));
                });
                
                // 遍历有效记录，计算2026年3月及以后的数据
                validRecords.forEach(record => {
                    const recordDate = new Date(record.date);
                    const recordYear = recordDate.getFullYear();
                    const recordMonth = recordDate.getMonth() + 1;
                    const monthKey = `${recordYear}-${recordMonth}`;
                    
                    // 只计算2026年3月及以后的数据
                    if (recordYear > 2026 || (recordYear === 2026 && recordMonth >= 3)) {
                        // 计算月度数据
                        if (!monthlyDataMap[monthKey]) {
                            monthlyDataMap[monthKey] = {
                                year: recordYear,
                                month: recordMonth,
                                income: 0,
                                expense: 0,
                                balance: 0
                            };
                        }
                        
                        if (record.type === 'income') {
                            monthlyDataMap[monthKey].income += record.amount;
                            realtimeYearlyData.income += record.amount;
                        } else {
                            monthlyDataMap[monthKey].expense += record.amount;
                            realtimeYearlyData.expense += record.amount;
                        }
                    }
                });
                
                // 计算每月结余
                Object.values(monthlyDataMap).forEach(month => {
                    month.balance = month.income - month.expense;
                });
                
                // 转换月度数据为数组，并按时间降序排序
                realtimeMonthlyData = Object.values(monthlyDataMap)
                    .filter(month => month.income > 0 || month.expense > 0)
                    .sort((a, b) => {
                        if (a.year !== b.year) {
                            return b.year - a.year;
                        } else {
                            return b.month - a.month;
                        }
                    });
                
                // 计算2026年实时年度结余
                realtimeYearlyData.balance = realtimeYearlyData.income - realtimeYearlyData.expense;
            }
            
            // 合并月度数据（实时数据在前，硬编码数据在后）
            this.monthlyDataList = [...realtimeMonthlyData, ...hardcodedMonthlyData];
            
            // 计算2026年的总年度数据（硬编码 + 实时）
            const hardcoded2026Data = { year: 2026, income: 9421.57, expense: 3299.94, balance: 6121.63 };
            const total2026Income = hardcoded2026Data.income + realtimeYearlyData.income;
            const total2026Expense = hardcoded2026Data.expense + realtimeYearlyData.expense;
            const total2026Balance = total2026Income - total2026Expense;
            
            // 设置当前年份（2026年）的数据
            this.yearlyIncome = total2026Income;
            this.yearlyExpense = total2026Expense;
            this.yearlyBalance = total2026Balance;
            
            // 合并年度数据
            const yearly2026Data = { 
                year: 2026, 
                income: total2026Income, 
                expense: total2026Expense, 
                balance: total2026Balance 
            };
            this.yearlyDataList = [yearly2026Data, ...hardcodedYearlyData];
            
            // 计算总数据
            const totalIncome = yearly2026Data.income + hardcodedYearlyData[0].income;
            const totalExpense = yearly2026Data.expense + hardcodedYearlyData[0].expense;
            
            this.totalIncome = totalIncome;
            this.totalExpense = totalExpense;
            this.totalBalance = totalIncome - totalExpense;
        },
        processRecords() {
            // 初始化数据
            let yearlyIncome = 0;
            let yearlyExpense = 0;
            let totalIncome = 0;
            let totalExpense = 0;
            
            // 初始化月度数据对象（包含所有年份的月份数据）
            const monthlyDataMap = {};
            // 初始化年度数据对象
            const yearlyDataMap = {};

            // 遍历记录，过滤出有效数据
            const validRecords = this.records.filter(record => {
                return this.isValidDate(record.date) && !isNaN(Number(record.amount));
            });

            // 遍历有效记录，计算各项数据
            validRecords.forEach(record => {
                const recordDate = new Date(record.date);
                const recordYear = recordDate.getFullYear();
                const recordMonth = recordDate.getMonth() + 1;
                const monthKey = `${recordYear}-${recordMonth}`;
                
                // 计算总收支
                if (record.type === 'income') {
                    totalIncome += record.amount;
                } else {
                    totalExpense += record.amount;
                }
                
                // 计算当前年份的收支数据
                if (recordYear === this.currentYear) {
                    if (record.type === 'income') {
                        yearlyIncome += record.amount;
                    } else {
                        yearlyExpense += record.amount;
                    }
                }
                
                // 计算每月的收支数据
                if (!monthlyDataMap[monthKey]) {
                    monthlyDataMap[monthKey] = {
                        year: recordYear,
                        month: recordMonth,
                        income: 0,
                        expense: 0,
                        balance: 0
                    };
                }
                
                if (record.type === 'income') {
                    monthlyDataMap[monthKey].income += record.amount;
                } else {
                    monthlyDataMap[monthKey].expense += record.amount;
                }
                
                // 计算每年的收支数据
                if (!yearlyDataMap[recordYear]) {
                    yearlyDataMap[recordYear] = {
                        year: recordYear,
                        income: 0,
                        expense: 0,
                        balance: 0
                    };
                }
                
                if (record.type === 'income') {
                    yearlyDataMap[recordYear].income += record.amount;
                } else {
                    yearlyDataMap[recordYear].expense += record.amount;
                }
            });

            // 计算每月结余
            Object.values(monthlyDataMap).forEach(month => {
                month.balance = month.income - month.expense;
            });

            // 计算每年的结余
            Object.values(yearlyDataMap).forEach(yearData => {
                yearData.balance = yearData.income - yearData.expense;
            });

            // 转换月度数据为数组，并按时间降序排序（年份降序，月份降序）
            const monthlyDataList = Object.values(monthlyDataMap)
                .filter(month => month.income > 0 || month.expense > 0)
                .sort((a, b) => {
                    if (a.year !== b.year) {
                        return b.year - a.year;
                    } else {
                        return b.month - a.month;
                    }
                });
            
            // 转换年度数据为数组，并按年份降序排序
            const yearlyDataList = Object.values(yearlyDataMap)
                .filter(yearData => yearData.income > 0 || yearData.expense > 0)
                .sort((a, b) => b.year - a.year);

            // 更新页面数据
            this.yearlyIncome = yearlyIncome;
            this.yearlyExpense = yearlyExpense;
            this.yearlyBalance = yearlyIncome - yearlyExpense;
            this.monthlyDataList = monthlyDataList;
            
            this.totalIncome = totalIncome;
            this.totalExpense = totalExpense;
            this.totalBalance = totalIncome - totalExpense;
            this.yearlyDataList = yearlyDataList;
        },
        isValidDate(dateString) {
            return !isNaN(Date.parse(dateString));
        }
    }
}
</script>

<style>
.bill-detail-container {
    min-height: 100vh;
    background-color: #f5f5f5;
    padding: 20px;
}

/* 账单明细上方部分 */
.bill-detail-header {
    display: flex;
    align-items: center;
    margin-bottom: 30px;
    position: relative;
}
/* 返回按键 */
.back-btn {
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    font-size: 18px;
    cursor: pointer;
    color: #333;
}
.bill-detail-header h1 {
    flex: 1;
    text-align: center;
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: #333;
}
.bill-detail-content {
    background-color: #fff;
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 账单标签页：月账单/年账单选择 */
.bill-tabs {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 20px;
}
.bill-tab-buttons {
    margin: 0 auto;
}
.year-selector {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 16px;
    font-weight: 500;
    color: #333;
}
.year-dropdown {
    font-size: 12px;
    color: #999;
    cursor: pointer;
}
.bill-tab-buttons {
    display: flex;
    background: #f5f5f5;
    border-radius: 8px;
    padding: 4px;
}
.bill-tab {
    padding: 6px 16px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    color: #666;
    cursor: pointer;
    transition: all 0.3s ease;
}
.bill-tab.active {
    background: #fff;
    color: #333;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 年结余卡片 */
.yearly-balance-card {
    background: linear-gradient(135deg, #ffeb3b 0%, #ffc107 100%);
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 20px;
    position: relative;
    overflow: hidden;
}
.yearly-balance-card::after {
    content: '¥';
    position: absolute;
    right: 20px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 80px;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.2);
}
.yearly-balance-title {
    font-size: 14px;
    color: #333;
    margin-bottom: 8px;
}
.yearly-balance-amount {
    font-size: 32px;
    font-weight: 700;
    color: #333;
    margin-bottom: 12px;
}
.yearly-income-expense {
    display: flex;
    gap: 24px;
    font-size: 14px;
    color: #333;
}

/* 月份列表 */
.monthly-list {
    border-radius: 8px;
    overflow: hidden;
}
.monthly-list-header {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr auto;
    gap: 16px;
    padding: 12px 16px;
    background: #f5f5f5;
    font-size: 14px;
    font-weight: 500;
    color: #666;
}
.monthly-list-content {
    background: #fff;
}
.monthly-item {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr auto;
    gap: 16px;
    padding: 16px;
    border-bottom: 1px solid #f0f0f0;
    font-size: 14px;
    color: #333;
    align-items: center;
}
.monthly-item:last-child {
    border-bottom: none;
}
.monthly-item-arrow {
    font-size: 12px;
    color: #999;
}

/* 年份列表 */
.yearly-list {
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 20px;
}
.yearly-list-header {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    gap: 16px;
    padding: 12px 16px;
    background: #f5f5f5;
    font-size: 14px;
    font-weight: 500;
    color: #666;
}
.yearly-list-content {
    background: #fff;
}
.yearly-item {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    gap: 16px;
    padding: 16px;
    border-bottom: 1px solid #f0f0f0;
    font-size: 14px;
    color: #333;
    align-items: center;
}
.yearly-item:last-child {
    border-bottom: none;
}

/* 年账单说明 */
.yearly-bill-note {
    text-align: center;
    font-size: 12px;
    color: #999;
    margin-top: 20px;
    padding-top: 16px;
    border-top: 1px solid #f0f0f0;
}

/* 响应式调整 */
@media (max-width: 480px) {
    .yearly-income-expense {
        flex-direction: column;
        gap: 8px;
    }
    
    .monthly-list-header,
    .monthly-item {
        grid-template-columns: 1fr 1fr 1fr 1fr;
    }
    
    .yearly-list-header,
    .yearly-item {
        grid-template-columns: 1fr 1fr 1fr 1fr;
    }
    
    .monthly-item-arrow {
        display: none;
    }
}
</style>