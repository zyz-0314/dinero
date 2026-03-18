<template>
    <!-- 账单部分，显示本月收支结余，点入后可显示过去每个月的收支结余 -->
    <div class="bill-container">
        <div class="bill" @click="goToBillDetail">
            <div class="bill-header">
                <span class="header-title">账单</span>
                <span class="header-unfold">></span>
            </div>
            <div class="horizontal-divider"></div>
            <div class="bill-content">
                <div class="bill-left">
                    <div class="bill-left-title">时间</div>
                    <div class="bill-left-content">{{ currentMonthLabel }}</div>
                </div>
                <div class="divider"></div>
                <div class="bill-right">
                    <div class="bill-row">
                        <div class="bill-right-label">收入</div>
                        <div class="amountTot">{{ incomeAmountTot.toFixed(2) }}</div>
                    </div>
                    <div class="bill-row">
                        <div class="bill-right-label">支出</div>
                        <div class="amountTot">{{ expenseAmountTot.toFixed(2) }}</div>
                    </div>
                    <div class="bill-row">
                        <div class="bill-right-label">结余</div>
                        <div class="amountTot">{{ balanceAmountTot.toFixed(2) }}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- 预算部分 -->
    <div class="budget-container">
        <div class="budget">
            <div class="budget-header">
                <span class="header-title">{{ currentMonthLabel }}总预算</span>
                <span class="set-budget" @click="handleBudget">+ 设置预算</span>
            </div>
            <div class="horizontal-divider"></div>
            <div class="budget-content">
                <div class="budget-left">
                    <div class="budget-circle">
                        <div class="circle-inner">
                            <div class="remaining-percent">{{ remainingBudgetPercent }}%</div>
                            <div class="remaining-text">剩余</div>
                        </div>
                    </div>
                </div>
                <div class="divider"></div>
                <div class="budget-right">
                    <div class="budget-row">
                        <div class="budget-right-label">剩余预算</div>
                        <div class="budget-amount">{{ remainingBudget.toFixed(2) }}</div>
                    </div>
                    <div class="budget-row">
                        <div class="budget-right-label">本月预算</div>
                        <div class="budget-amount">{{ monthlyBudget.toFixed(2) }}</div>
                    </div>
                    <div class="budget-row">
                        <div class="budget-right-label">本月支出</div>
                        <div class="budget-amount">{{ expenseAmountTot.toFixed(2) }}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- 背景遮罩 -->
    <div v-if="showInputBox" class="modal-overlay active" @click="cancelBudget"></div>
    <!-- 预算输入框 -->
    <div v-if="showInputBox" class="budget-input">
        <div class="budget-input-header">
            <h3>设置本月预算</h3>
        </div>
        <div class="budget-input-content">
            <input 
                class="input-box" 
                v-model="budgetInput" 
                type="number" 
                placeholder="请输入预算金额"
                min="0"
                step="100"
            />
        </div>
        <div class="budget-input-footer">
            <button class="cancel-btn" @click="cancelBudget">取消</button>
            <button class="confirm-btn" @click="confirmBudget">确认</button>
        </div>
    </div>

    <!-- 总资产部分 -->
    <div class="total-assets-container">
        <div class="total-assets" @click="goToAssetsDetail">
            <div class="total-assets-header">
                <span class="header-title">总资产</span>
                <span class="header-unfold">></span>
            </div>
            <div class="horizontal-divider"></div>
            <div class="total-assets-content">
                <div class="content-label">资产</div>
                <div class="content-num">{{ totalAssets.toFixed(2) }}</div>
            </div>
        </div>
    </div>

</template>

<script>
export default {
    name: 'MoneyManagement',
    data() {
        return {
            currentMonth: '',
            incomeAmountTot: 0,
            expenseAmountTot: 0,
            balanceAmountTot: 0,
            records: [],
            monthlyBudget: 2000, //默认每月预算2000
            showInputBox: false,
            budgetInput: '',
            totalAssets: 0,
            netAssets: 0,
            assets: [
                {
                    id: 1,
                    name: '微信',
                    amount: 0,
                    category: 'virtual'
                },
                {
                    id: 2,
                    name: '支付宝',
                    amount: 0,
                    category: 'virtual'
                },
                {
                    id: 3,
                    name: '',
                    amount: 0,
                    category: 'bank'
                },
                {
                    id: 4,
                    name: '',
                    amount: 0,
                    category: 'cash'
                }
            ]
        }
    },
    computed: {
        currentMonthLabel() {
            const now = new Date()
            const year = now.getFullYear()
            const month = now.getMonth() + 1
            return `${year}年${month}月`
        },
        remainingBudget() {
            return Math.max(0, this.monthlyBudget - this.expenseAmountTot)
        },
        remainingBudgetPercent() {
            if (this.monthlyBudget === 0) return 0
            const percent = Math.round((this.remainingBudget / this.monthlyBudget) * 100)
            return Math.min(100, Math.max(0, percent))
        }
    },
    created() {
        this.loadRecords()
        this.loadBudget()
        this.loadAssets()
        this.calculateAssets()
        window.addEventListener('recordAdded', this.loadRecords)
    },
    unmounted() {
        window.removeEventListener('recordAdded', this.loadRecords)
    },
    methods: {
        loadRecords() {
            //读取本地存储
            const storedRecords = localStorage.getItem('recordDetailList')
            if(storedRecords) {
                this.records = JSON.parse(storedRecords)
                this.processRecords()
            } else {
                this.records = []
                this.incomeAmountTot = 0
                this.expenseAmountTot = 0
                this.balanceAmountTot = 0
            }
        },
        processRecords() {
            let totalIncome = 0
            let totalExpense = 0
            
            //获取当前月份
            const now = new Date()
            const currentYear = now.getFullYear()
            const currentMonth = now.getMonth() + 1

            //遍历之前现过滤，移除没有date或者createTime的脏数据，并只保留当前月份的数据
            const validRecords = this.records.filter(record => {
                if (!this.isValidDate(record.date) || isNaN(Number(record.amount))) {
                    return false
                }
                const recordDate = new Date(record.date)
                return recordDate.getFullYear() === currentYear && recordDate.getMonth() + 1 === currentMonth
            })

            //遍历清洗之后的数据
            validRecords.forEach(record => {
                //总计收支
                if(record.type === 'income') {
                    totalIncome += record.amount
                } else {
                    totalExpense += record.amount
                }
            })

            //更新页面数据
            this.incomeAmountTot = totalIncome
            this.expenseAmountTot = totalExpense
            this.balanceAmountTot = totalIncome - totalExpense
        },
        isValidDate(dateString) {
            return !isNaN(Date.parse(dateString))
        },
        loadBudget() {
            //从本地存储加载预算
            const now = new Date()
            const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
            const storedBudget = localStorage.getItem(`budget_${currentMonthKey}`)
            if (storedBudget) {
                this.monthlyBudget = parseFloat(storedBudget)
            }
        },
        handleBudget() {
            //打开预算输入框
            this.budgetInput = this.monthlyBudget.toString()
            this.showInputBox = true
        },
        cancelBudget() {
            //关闭预算输入框
            this.showInputBox = false
            this.budgetInput = ''
        },
        confirmBudget() {
            //确认设置预算
            const budget = parseFloat(this.budgetInput)
            if (!isNaN(budget) && budget >= 0) {
                this.monthlyBudget = budget
                //保存预算到本地存储
                const now = new Date()
                const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
                localStorage.setItem(`budget_${currentMonthKey}`, budget.toString())
            }
            this.showInputBox = false
            this.budgetInput = ''
        },
        //展开总资产界面
        handleAssetsUnfold() {
            this.showAssetsDetails = true
        },
        //计算资产
        calculateAssets() {
            this.totalAssets = this.assets.reduce((sum, asset) => sum + asset.amount, 0)
            this.netAssets = this.totalAssets
        },
        //加载资产数据
        loadAssets() {
            const storedAssets = localStorage.getItem('assets')
            if (storedAssets) {
                this.assets = JSON.parse(storedAssets)
            }
        },
        //保存资产数据
        saveAssets() {
            localStorage.setItem('assets', JSON.stringify(this.assets))
        },
        //导航到资产详情页面
        goToAssetsDetail() {
            this.$router.push({ name: 'MyAssetsDetail' })
        },
        // 导航到账单详情页面
        goToBillDetail() {
            this.$router.push({ name: 'BillDetail' })
        },

        //获取资产分类名称
        getCategoryName(category) {
            const nameMap = {
                cash: '现金',
                bank: '银行',
                virtual: '虚拟账户',
                investment: '投资',
                property: '房产'
            }
            return nameMap[category] || '其他'
        }
    }
}
</script>

<style>
/* 账单卡片 */
.bill-container {
    padding: 0 16px;
    margin-top: 20px;
    box-sizing: border-box;
}
.bill {
    background: #fff;
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}
.bill-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}
.header-title {
    font-size: 18px;
    font-weight: 600;
    color: #333;
}
.header-unfold {
    font-size: 14px;
    color: #999;
    cursor: pointer;
}
.horizontal-divider {
    width: 100%;
    height: 1px;
    background: rgba(122, 77, 0, 0.3);
    margin: 12px 0;
}
.bill-content {
    display: flex;
    align-items: center;
}
.bill-left {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    margin-right: 20px;
    flex-shrink: 0;
}
.bill-left-title {
    font-size: 14px;
    color: #000000;
    margin-bottom: 4px;
}
.bill-left-content {
    font-size: 24px;
    font-weight: 700;
    color: #999;
    padding: 8px 12px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.3);
    backdrop-filter: blur(4px);
    min-width: 120px;
}
.divider {
    width: 1px;
    height: 50px;
    background: rgba(122, 77, 0, 0.3);
    margin-right: 20px;
}
.bill-right {
    flex: 1;
    display: flex;
    justify-content: space-around;
    align-items: center;
    user-select: none;
}
.bill-row {
    display: flex;
    flex-direction: column;
    align-items: center;
}
.bill-right-label {
    color: #000000;
    font-size: 14px;
    margin-bottom: 4px;
}
.amountTot {
    font-size: 24px;
    font-weight: 700;
    color: #999;
}

/* 预算卡片 */
.budget-container {
    padding: 0 16px;
    margin-top: 20px;
    box-sizing: border-box;
}
.budget {
    background: #fff;
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}
.budget-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}
.set-budget {
    font-size: 14px;
    color: #ff9500;
    font-weight: 500;
    cursor: pointer;
}
.budget-content {
    display: flex;
    align-items: center;
}
.budget-left {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-right: 20px;
    flex-shrink: 0;
}
.budget-circle {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: #f5f5f5;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
}
.budget-circle::before {
    content: '';
    position: absolute;
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: #fff;
}
.circle-inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 1;
}
.remaining-percent {
    font-size: 24px;
    font-weight: 700;
    color: #ff9500;
}
.remaining-text {
    font-size: 12px;
    color: #999;
    margin-top: 2px;
}
.budget-right {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;
}
.budget-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.budget-right-label {
    color: #000000;
    font-size: 14px;
}
.budget-amount {
    font-size: 16px;
    font-weight: 500;
    color: #999;
}

/* 预算输入框 */
.budget-input {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 80%;
    max-width: 300px;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    overflow: hidden;
}
.budget-input-header {
    padding: 16px;
    border-bottom: 1px solid #e5e7eb;
    text-align: center;
}
.budget-input-header h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #333;
}
.budget-input-content {
    padding: 20px 16px;
}
.input-box {
    width: 100%;
    padding: 12px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    font-size: 16px;
    box-sizing: border-box;
    outline: none;
    transition: border-color 0.3s ease;
}
.input-box:focus {
    border-color: #ff9500;
    box-shadow: 0 0 0 2px rgba(255, 149, 0, 0.2);
}
.budget-input-footer {
    display: flex;
    border-top: 1px solid #e5e7eb;
}
.cancel-btn, .confirm-btn {
    flex: 1;
    padding: 12px;
    border: none;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
}
.cancel-btn {
    background: #f5f5f5;
    color: #666;
    border-right: 1px solid #e5e7eb;
}
.confirm-btn {
    background: linear-gradient(135deg, #969696 0%, #605858 100%);
    color: #fff;
}
.cancel-btn:hover {
    background: #e5e7eb;
}
.confirm-btn:hover {
    opacity: 0.9;
}

/* 总资产卡片 */
.total-assets-container {
    padding: 0 16px;
    margin-top: 20px;
    box-sizing: border-box;
}
.total-assets {
    background: #fff;
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}
.total-assets-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}
.total-assets-content {
    display: flex;
    align-items: center;
    justify-content: center;
}
.content-label {
    display: flex;
    flex-direction: column;
}
.content-num {
    display: flex;
    margin-left: auto;
    flex-direction: column;
    font-size: 16px;
    font-weight: 500;
    color: #999;
}

/* 总资产展开模态框 */
.total-assets-details {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: #f5f5f5;
    z-index: 1000;
    overflow-y: auto;
}
.assets-details-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 16px;
    background: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    position: sticky;
    top: 0;
    z-index: 10;
}
.assets-details-header h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #333;
}
.close-btn {
    font-size: 24px;
    color: #999;
    cursor: pointer;
}
.close-btn:hover {
    color: #333;
}
.net-assets-card {
    margin: 16px;
    background: #fff;
    border-radius: 12px;
    padding: 20px;
    text-align: center;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
.net-assets-title {
    font-size: 14px;
    color: #333;
    margin-bottom: 8px;
}
.net-assets-amount {
    font-size: 32px;
    font-weight: 700;
    color: #333;
    margin-bottom: 12px;
}
.assets-liabilities {
    display: flex;
    justify-content: center;
    gap: 24px;
    font-size: 14px;
    color: #666;
}
.assets-list {
    margin: 16px;
}
.assets-category {
    background: #fff;
    border-radius: 12px;
    margin-bottom: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    overflow: hidden;
}
.category-header {
    display: flex;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid #f0f0f0;
}
.category-icon {
    font-size: 20px;
    margin-right: 12px;
}
.category-name {
    flex: 1;
    font-size: 16px;
    font-weight: 500;
    color: #333;
}
.category-amount {
    font-size: 16px;
    font-weight: 500;
    color: #666;
}
.category-items {
    padding: 8px 0;
}
.asset-item {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid #f9f9f9;
}
.asset-item:last-child {
    border-bottom: none;
}
.asset-icon {
    font-size: 20px;
    margin-right: 12px;
}
.asset-name {
    flex: 1;
    font-size: 14px;
    color: #333;
}
.asset-amount {
    font-size: 14px;
    font-weight: 500;
    color: #666;
    margin-right: 12px;
}
.asset-actions {
    margin-left: auto;
}
.edit-btn {
    font-size: 12px;
    color: #4CAF50;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
    margin-right: 8px;
}

.edit-btn:hover {
    background: #e8f5e9;
}

.delete-btn {
    font-size: 12px;
    color: #ff6b6b;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
}

.delete-btn:hover {
    background: #ffe6e6;
}
.add-asset-btn {
    margin: 16px;
    padding: 16px;
    background: #fff;
    border-radius: 12px;
    text-align: center;
    font-size: 16px;
    font-weight: 500;
    color: #ff9500;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    border: 1px dashed #ff9500;
}
.add-asset-btn:hover {
    background: #fff9f0;
}
.add-asset-modal {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 80%;
    max-width: 400px;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    z-index: 1001;
    overflow: hidden;
}
.add-asset-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid #e5e7eb;
}
.add-asset-header h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #333;
}
.add-asset-content {
    padding: 20px 16px;
}
.form-group {
    margin-bottom: 16px;
}
.form-group label {
    display: block;
    font-size: 14px;
    font-weight: 500;
    color: #333;
    margin-bottom: 8px;
}
.form-input,
.form-select {
    width: 100%;
    padding: 12px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    font-size: 14px;
    box-sizing: border-box;
    outline: none;
    transition: border-color 0.3s ease;
}
.form-input:focus,
.form-select:focus {
    border-color: #ff9500;
    box-shadow: 0 0 0 2px rgba(255, 149, 0, 0.2);
}
.add-asset-footer {
    display: flex;
    border-top: 1px solid #e5e7eb;
}
.add-asset-footer .cancel-btn,
.add-asset-footer .confirm-btn {
    flex: 1;
    padding: 12px;
    border: none;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
}
.add-asset-footer .cancel-btn {
    background: #f5f5f5;
    color: #666;
    border-right: 1px solid #e5e7eb;
}
.add-asset-footer .confirm-btn {
    background: linear-gradient(135deg, #ff9500 0%, #ffb74d 100%);
    color: #fff;
}
.add-asset-footer .cancel-btn:hover {
    background: #e5e7eb;
}
.add-asset-footer .confirm-btn:hover {
    opacity: 0.9;
}
</style>