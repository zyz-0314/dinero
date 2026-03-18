<template>
    <!--
    <div class="header-container">
        <p class="words" contenteditable="true">skywaalker.z</p>
    </div>
    -->
    <!-- 顶部的总计卡片 -->
    <div class="card-container">
        <div class="card">
            <div class="card-left">
                <div class="time-title">时间</div>
                <div class="month-selector">
                    <select v-model="selectedMonth" @change="handleMonthChange">
                        <option v-for="month in availableMonths" :key="month.value" :value="month.value">
                            {{ month.label }}
                        </option>
                    </select>
                </div>
            </div>
            <div class="divider"></div>
            <div class="card-right">
                <div class="row">
                    <div class="card-right-label">收入</div>
                    <div class="amountTot">{{ incomeAmountTot.toFixed(2) }}</div>
                </div>
                <div class="row">
                    <div class="card-right-label">支出</div>
                    <div class="amountTot">{{ expenseAmountTot.toFixed(2) }}</div>
                </div>
            </div>
        </div>
    </div>

    <!-- 每日卡片组 -->
    <div v-if="groupedDetails.length>0" class="detail-list">
        <!-- 日期标题，每日支出收入总计 -->
        <div v-for="(group, groupIdx) in groupedDetails" :key="groupIdx" class="day-group">
            <div class="date-header">
                <span class="date">{{ formatDate(group.date) }}</span>
                <div class="amount-group">
                    <span class="amount">收入：{{ group.incomeAmount.toFixed(2) }}</span>
                    <span class="amount">支出：{{ group.expenseAmount.toFixed(2) }}</span>
                </div>
            </div>
            <!-- 明细 -->
            <div
                v-for="(record, idx) in group.records"
                :key="idx" 
                class="detail-card"
                @click="viewOperation(record)"
            >
                <span class="detail-purpose">
                    {{ getCategoryLabel(record.type, record.category) }}
                    <span v-if="record.remark" class="remark">{{ record.remark }}</span>
                </span>
                <span 
                    class="detail-figure"
                    :class="{ income: record.type === 'income', expense: record.type === 'expense' }"
                >
                    {{ record.type === 'income' ? '+' : '-' }}{{ record.amount.toFixed(2) }}
                </span>
            </div>
        </div>
        
    </div>

    <!-- 添加明细按钮 -->
    <div class="add-detail" @click="goAdd">
        <span class="add-icon">+</span>
    </div>

    <!-- 背景遮罩 -->
    <div v-if="showOperation" class="modal-overlay active" @click="handleOutsideClick"></div>
    <!-- 模态框，针对点击明细卡片之后跳出的操作选项：编辑和删除 -->
    <div v-if="showOperation" class="operation-card active">
        <span class="op-choice" @click="handleEdit">编辑</span>
        <span class="op-choice" @click="handleDelete">删除</span>
    </div>
</template>

<script>
import { isValidDate } from '@/utils/time';

export default {
    name: 'MoneyDetails',
    data() {
        return {
            incomeAmountTot: 0,
            expenseAmountTot: 0,
            groupedDetails: [],
            records: [],
            recordCount: 0,
            showOperation: false,
            currentRecord: null,
            selectedMonth: '',
            availableMonths: []
        }
    },
    computed: {
        selectedYear() {
            if (!this.selectedMonth) return new Date().getFullYear();
            return this.selectedMonth.split('-')[0];
        }
    },
    created() {
        this.loadRecords()
        window.addEventListener('recordAdded', this.loadRecords)
    },
    unmounted() {
        window.removeEventListener('recordAdded', this.loadRecords)
    },
    methods: {
        goAdd() {
            //跳转到AddDetails路由
            this.$router.push({ name: 'AddDetails' })
        },
        loadRecords() {
            //读取本地存储
            const storedRecords = localStorage.getItem('recordDetailList')
            if(storedRecords) {
                this.records = JSON.parse(storedRecords)
                //动态计算总数
                this.recordCount = this.records.length
                this.generateAvailableMonths()
                this.processRecords()
            } else {
                this.recordCount = 0
                this.groupedDetails = []
                this.records = []
                this.generateAvailableMonths()
                this.processRecords()
            }
        },
        generateAvailableMonths() {
            const monthSet = new Set()
            
            //添加当前月份
            const now = new Date()
            const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
            monthSet.add(currentMonthKey)
            
            //从记录中提取所有月份
            this.records.forEach(record => {
                if (isValidDate(record.date)) {
                    const recordDate = new Date(record.date)
                    const monthKey = `${recordDate.getFullYear()}-${String(recordDate.getMonth() + 1).padStart(2, '0')}`
                    monthSet.add(monthKey)
                }
            })
            
            //转换为数组并排序
            this.availableMonths = Array.from(monthSet).map(monthKey => {
                const [year, month] = monthKey.split('-')
                return {
                    value: monthKey,
                    label: `${year}年${month}月`
                }
            }).sort((a, b) => b.value.localeCompare(a.value))
            
            //如果没有选择月份，设置为当前月份
            if (!this.selectedMonth) {
                this.selectedMonth = currentMonthKey
            }
        },
        handleMonthChange() {
            this.processRecords()
        },
        processRecords() {
            const groupMap = {}
            let totalIncome = 0
            let totalExpense = 0
            
            //解析选择的月份
            if (!this.selectedMonth) {
                this.incomeAmountTot = 0
                this.expenseAmountTot = 0
                this.groupedDetails = []
                return
            }
            
            const [selectedYear, selectedMonth] = this.selectedMonth.split('-').map(Number)

            //遍历之前现过滤，移除没有date或者createTime的脏数据，并只保留选择月份的数据
            const validRecords = this.records.filter(record => {
                if (!record || !isValidDate(record.date) || isNaN(Number(record.amount))) {
                    return false
                }
                const recordDate = new Date(record.date)
                return recordDate.getFullYear() === selectedYear && recordDate.getMonth() + 1 === selectedMonth
            })

            //遍历清洗之后的数据
            validRecords.forEach(record => {
                const recordDate = new Date(record.date).toISOString().split('T')[0]
                
                //初始化日期分组
                if(!groupMap[recordDate]) {
                    groupMap[recordDate] = {
                        incomeAmount: 0,
                        expenseAmount: 0,
                        records: []
                    }
                }

                //总计收支
                if(record.type === 'income') {
                    groupMap[recordDate].incomeAmount += record.amount
                    totalIncome += record.amount
                } else {
                    groupMap[recordDate].expenseAmount += record.amount
                    totalExpense += record.amount
                }

                //添加记录到分组
                groupMap[recordDate].records.push(record)
            })

            //更新页面数据
            this.groupedDetails = Object.entries(groupMap).map(([date, data]) => ({
                date,
                incomeAmount: data.incomeAmount,
                expenseAmount: data.expenseAmount,
                records: data.records.sort((a, b) => {
                    const timeA = a.createTime ? new Date(a.createTime).getTime() : 0
                    const timeB = b.createTime ? new Date(b.createTime).getTime() : 0
                    return timeB - timeA
                })
            })).sort((a, b) => b.date.localeCompare(a.date)) //日期最新的在最上方

            this.incomeAmountTot = totalIncome
            this.expenseAmountTot = totalExpense
        },

        //格式化日期显示
        formatDate(dateStr) {
            const date = new Date(dateStr)
            return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
        },
        
        //获取分类标签
        getCategoryLabel(type, value) {
            const expenseMap = {
                food: '餐饮',
                breakfast: '早饭',
                lunch: '中饭',
                dinner: '晚饭',
                water: '水',
                'late-night-snack': '夜宵',
                snacks: '零食',
                drinks: '饮品',
                transport: '交通',
                daily: '日常',
                sports: '运动',
                books: '书籍',
                digital: '数码',
                entertain: '娱乐',
                medical: '医疗',
                clothes: '服饰',
                travel: '旅行',
                tripFare: '路费',
                tripAccomodation: '住宿',
                tripTransport: '交通',
                tripFood: '餐饮',
                tickets: '门票',
                specialist: '特产/纪念品',
                tripOthers: '其他',
                'expense-others': '其他'
            }
            const incomeMap = {
                allowance: '生活费',
                bonus: '奖金',
                salary: '工资',
                'second-job': '副业',
                unused: '闲置',
                envelope: '红包',
                'income-others': '其他'
            }
            
            //处理餐饮子分类
            if(type === 'expense' && ['breakfast', 'lunch', 'dinner', 'water', 'late-night-snack', 'snacks', 'drinks'].includes(value)) {
                return `餐饮-${expenseMap[value]}`
            }
            // 处理旅行子分类
            if(type === 'expense' && (value.startsWith('trip') || ['tickets', 'specialist'].includes(value))) {
                return `旅行-${expenseMap[value]}`
            }
            
            return type === 'expense' ? expenseMap[value] : incomeMap[value]
        },

        viewOperation(record) {
            this.showOperation = true
            this.currentRecord = record
            console.log('Selected record:', record)
            // 使用setTimeout确保事件监听器在DOM更新后添加
            setTimeout(() => {
                document.addEventListener('mouseup', this.handleOutsideClick)
            }, 0)
        },
        handleOutsideClick(event) {
            //检查点击的目标是否在模态框内部
            const modal = event.target.closest('.operation-card')
            // 如果点击的目标不在模态框内部，关闭模态框
            if(!modal) {
                this.showOperation = false
                document.removeEventListener('mouseup', this.handleOutsideClick)
            }
        },
        handleEdit() {
            console.log('handleEdit called')
            console.log('Current record:', this.currentRecord)
            console.log('Router object:', this.$router)
            
            //关闭模态框并移除事件监听器
            this.showOperation = false
            document.removeEventListener('mouseup', this.handleOutsideClick)
            
            //跳转到编辑页面并传递当前记录
            try {
                setTimeout(() => {
                    console.log('Attempting to navigate to EditDetails')
                    this.$router.push({
                        path: '/editDetails',
                        query: {
                            record: JSON.stringify(this.currentRecord)
                        }
                    })
                    console.log('Navigation attempted')
                }, 100)
            } catch (error) {
                console.error('Navigation error:', error)
            }
        },
        handleDelete() {
            //从localStorage中获取所有记录
            const storedRecords = localStorage.getItem('recordDetailList')
            if(storedRecords) {
                let records = JSON.parse(storedRecords)
                // 找到要删除的记录
                const recordToDelete = records.find(record => {
                    return record.type === this.currentRecord.type &&
                        record.category === this.currentRecord.category &&
                        record.amount == this.currentRecord.amount &&
                        record.date === this.currentRecord.date &&
                        record.remark === this.currentRecord.remark
                })
                
                // 过滤掉当前要删除的记录
                records = records.filter(record => {
                    //比较记录的关键属性来确定要删除的记录
                    return !(record.type === this.currentRecord.type &&
                        record.category === this.currentRecord.category &&
                        record.amount == this.currentRecord.amount &&
                        record.date === this.currentRecord.date &&
                        record.remark === this.currentRecord.remark)
                })
                //保存回localStorage
                localStorage.setItem('recordDetailList', JSON.stringify(records))
                
                // 如果找到要删除的记录且有资产ID，更新资产余额
                if (recordToDelete && recordToDelete.assetId) {
                    this.updateAssetBalanceOnDelete(recordToDelete)
                }
                
                //重新加载记录
                this.loadRecords()
            }
            //关闭模态框
            this.showOperation = false
            document.removeEventListener('mouseup', this.handleOutsideClick)
        },
        // 删除记录时更新资产余额
        updateAssetBalanceOnDelete(record) {
            const storedAssets = localStorage.getItem('assets')
            if (storedAssets) {
                let assets = JSON.parse(storedAssets)
                
                // 找到对应的资产
                const assetIndex = assets.findIndex(asset => asset.id === record.assetId)
                if (assetIndex !== -1) {
                    // 根据记录类型恢复资产余额
                    if (record.type === 'income') {
                        // 收入记录被删除，资产余额减少
                        assets[assetIndex].amount -= record.amount
                    } else {
                        // 支出记录被删除，资产余额增加
                        assets[assetIndex].amount += record.amount
                    }
                    
                    // 保存更新后的资产数据
                    localStorage.setItem('assets', JSON.stringify(assets))
                    console.log("资产余额已恢复：", assets[assetIndex])
                }
            }
        }
    }
}
</script>

<style>
/* 顶部总计卡片部分 */
.card-container {
    padding: 0 16px;
    margin-top: 20px;
    box-sizing: border-box;
}
.card {
    display: flex;
    align-items: center;
    background: #fff;
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    overflow: hidden;
}
.card-left{
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    margin-right: 20px;
    flex-shrink: 0;
}
.time-title {
    font-size: 14px;
    color: #000000;
    margin-bottom: 4px;
}
.month-selector {
    position: relative;
    border-radius: 8px;
    overflow: hidden;
    background: rgba(255, 255, 255, 0.3);
    backdrop-filter: blur(4px);
}
.month-selector select {
    border: none;
    background: transparent;
    color: #999;
    font-size: 24px;
    font-weight: 700;
    cursor: pointer;
    outline: none;
    appearance: none;
    padding: 8px 30px 8px 12px;
    min-width: 120px;
    transition: all 0.3s ease;
}
.month-selector select:hover {
    background: rgba(255, 255, 255, 0.4);
}
.month-selector select:focus {
    background: rgba(255, 255, 255, 0.5);
    box-shadow: 0 0 0 2px rgba(153, 153, 153, 0.2);
}
.month-selector::after {
    content: '▼';
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #999;
    font-size: 12px;
    pointer-events: none;
    transition: transform 0.3s ease;
}
.month-selector:hover::after {
    transform: translateY(-50%) scale(1.1);
}
.card-left select option {
    background: #fff;
    color: #999;
    padding: 10px 16px;
    font-weight: 500;
    font-size: 15px;
    margin: 4px 0;
    transition: background-color 0.2s ease;
}
.card-left select option:hover {
    background: #f5f5f5;
}
.divider {
    width: 1px;
    height: 50px;
    background: rgba(122, 77, 0, 0.3);
    margin-right: 20px;
}
.card-right{
    flex: 1;
    display: flex;
    justify-content: space-around;
    align-items: center;
    user-select: none;
}

.row{
    display: flex;
    flex-direction: column;
    align-items: center;
}
.card-right-label{
    color: #000000;
    font-size: 14px;
    margin-bottom: 4px;
}
.amountTot{
    font-size: 24px;
    font-weight: 700;
    color: #999;
}

/* 添加明细的加号按钮 */
.add-detail {
    position: fixed;
    right: 26px;
    bottom: 90px;
    width: 56px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: linear-gradient(135deg, #969696 0%, #605858 100%);
    box-shadow: 0 10px 24px rgba(0,0,0,0.18);
    cursor: pointer;
}
.add-icon {
    user-select: none;
    color: #f1e1e1;
}

/* 明细卡片 */
.detail-list {
    display: flex;
    flex-direction: column;
    padding: 0 16px;
    box-sizing: border-box;
    width: 100%;
}
.day-group {
    width: 100%;
}
.date-header {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    margin-top: 20px;
    color: #999;
}
.amount {
    padding: 10px;
}
.detail-card {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    padding: 16px;
    margin-bottom: 5px;
    width: 100%;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(16, 24, 40, 0.06);
    transition: all 0.3s;
    box-sizing: border-box; /*保证盒子模型计算正确*/
}
.detail-card:hover {
    box-shadow: 0 6px 18px rgba(16, 24, 40, 0.08);
    transform: translateY(-2px);
}

.remark {
    font-size: 12px;
    color: #999;
    margin-left: 4px;
}

/* 背景遮罩 */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 999;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.modal-overlay.active {
    opacity: 1;
}

/* 明细卡片的操作选项 */
.operation-card {
    display: flex;
    flex-direction: column;
    width: 280px;
    padding: 0;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0.9);
    background-color: #fff;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    overflow: hidden;
    opacity: 0;
    transition: all 0.3s ease;
}

.operation-card.active {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
}
.op-choice {
    width: 100%;
    padding: 12px 0;
    text-align: center;
    display: block;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 16px;
    background-color: #fff;
}
.op-choice:first-child {
    color: #999;
    border-bottom: 1px solid #e5e7eb;
}
.op-choice:last-child {
    color: #999;
}
</style>