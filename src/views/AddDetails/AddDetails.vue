<template>
    <div class="add-record">
        <div class="add-header-container">
            <!-- 右上角返回选项 -->
            <button class="back-btn" @click="handleBack">返回</button>

            <!-- 顶部：收入/支出二选一 -->
            <TypeToggle v-model="recordType" />
        </div>
        
        <!-- 分类选项面板（主要区域，根据收入支出的选择而切换） -->
        <div class="main-panel">
            <!-- 支出分类面板 -->
            <ExpensePanel
                v-if="recordType === 'expense' && !isTravelCategory && !isFoodCategory"
                v-model="category"
            />
            <!-- 餐饮子分类面板 -->
            <FoodPanel
                v-else-if="recordType === 'expense' && isFoodCategory"
                v-model="category"
            />
            <!-- 旅行子分类面板 -->
            <TravelPanel
                v-else-if="recordType === 'expense' && isTravelCategory"
                v-model="category"
            />
            <!-- 收入分类面板 -->
            <IncomePanel
                v-else
                v-model="category"
            />
        </div>

        <!-- 数字键盘组件 -->
        <InputKeyboard
            @date-change="handleDateChange"
            @confirm="handleConfirm"
            :remark="remark"
            v-model:amount="amount"
            @update:remark="val => remark = val"
            :assets="assets"
            v-model:selectedAssetId="selectedAssetId"
            @update:selectedAssetId="val => selectedAssetId = val"
            class="input-keyboard"
        />
    </div>
</template>

<script>
import { isValidDate, isFutureDate, getTodayDate } from '@/utils/time';
import TypeToggle from '@/components/TypeToggle.vue';
import ExpensePanel from './ExpensePanel.vue';
import IncomePanel from './IncomePanel.vue';
import TravelPanel from './TravelPanel.vue';
import FoodPanel from './FoodPanel.vue';
import router from '@/router';
import InputKeyboard from '@/components/InputKeyboard.vue';

export default {
    name: 'AddDetails',
    components: {
        TypeToggle,
        ExpensePanel,
        IncomePanel,
        TravelPanel,
        FoodPanel,
        InputKeyboard
    },
    data() {
        return {
            recordType: 'expense',
            category: '',
            amount: '0',
            recordDate: '',
            remark: '',
            assets: [],
            selectedAssetId: null
        }
    },
    computed: {
        //判断是否选择了旅行分类或旅行子分类
        isTravelCategory() {
            return this.category === 'travel' || 
                   this.category.startsWith('trip') || 
                   ['tickets', 'specialist'].includes(this.category);
        },
        //判断是否选择了餐饮分类或餐饮子分类
        isFoodCategory() {
            return this.category === 'food' || 
               ['breakfast', 'lunch', 'dinner', 'water', 'late-night-snack', 'snacks', 'drinks'].includes(this.category);
        },
        //格式化金额显示
        formattedAmount() {
            if(!this.amount) return '0.00'
            const [integer, decimal = '00'] = this.amount.split('.')
            const fixedDecimal = decimal.padEnd(2, '0').slice(0, 2)
            return `${integer}.${fixedDecimal}`
        }
    },
    created() {
        //初始化日期为今日
        this.recordDate = getTodayDate()
        //加载资产数据
        this.loadAssets()
    },
    methods: {
        //加载资产数据
        loadAssets() {
            const storedAssets = localStorage.getItem('assets')
            if (storedAssets) {
                this.assets = JSON.parse(storedAssets)
                // 按优先级排序资产
                this.assets.sort((a, b) => (a.priority || 999) - (b.priority || 999))
                // 默认选择优先级最高的资产
                if (this.assets.length > 0 && !this.selectedAssetId) {
                    this.selectedAssetId = this.assets[0].id
                }
            }
        },
        //返回
        handleBack() {
            router.go(-1) //返回上一页
        },

        //日期变更处理
        handleDateChange(date) {
            if(!date) return
            this.recordDate = date
            console.log("日期已更新为：", new Date(date).toLocaleDateString())
        },

        handleConfirm() {
            if(!this.category || this.amount==='0') {
                alert('请选择分类并输入有效金额')
                return
            }

            if(!isValidDate(this.recordDate)) {
                alert('请选择有效日期')
                return
            }

            if(isFutureDate(this.recordDate)) {
                alert('不可选择未来的时间日期')
                return
            }

            if(!this.selectedAssetId) {
                alert('请选择资产来源')
                return
            }
            
            //构造记录数据
            const record = {
                type: this.recordType,
                category: this.category,
                amount: parseFloat(this.formattedAmount),
                remark: this.remark || '',
                date: new Date(this.recordDate).toISOString().split('T')[0], //选中日期
                createTime: new Date().toISOString(), //提交日期
                assetId: this.selectedAssetId //添加资产ID
            }

            console.log("已保存记录：", record)

            //简单存储数据至本地（存储逻辑方式后期需要重写）
            const exisitingRecords = JSON.parse(localStorage.getItem('recordDetailList') || '[]') //读取现有记录
            exisitingRecords.push(record) //追加新纪录
            localStorage.setItem('recordDetailList', JSON.stringify(exisitingRecords)) //保存回本地存储

            //更新资产数据
            this.updateAssetBalance()

            //触发事件+跳转
            router.push({ name: 'MoneyDetails' }).then(() => {
                window.dispatchEvent(new Event('recordAdded'))
            })
        },
        // 更新资产余额
        updateAssetBalance() {
            const amount = parseFloat(this.formattedAmount)
            const storedAssets = localStorage.getItem('assets')
            if (storedAssets) {
                let assets = JSON.parse(storedAssets)
                
                // 找到选中的资产
                const assetIndex = assets.findIndex(asset => asset.id === this.selectedAssetId)
                if (assetIndex !== -1) {
                    // 根据记录类型更新资产余额
                    if (this.recordType === 'income') {
                        assets[assetIndex].amount += amount
                    } else {
                        assets[assetIndex].amount -= amount
                    }
                    
                    // 保存更新后的资产数据
                    localStorage.setItem('assets', JSON.stringify(assets))
                    console.log("资产余额已更新：", assets[assetIndex])
                }
            }
        }
    }
}

</script>

<style>
.add-header-container {
    position: relative;
    padding: 16px;
    text-align: center;
}
.back-btn {
    position: absolute;
    top: 50%;
    right: 16px;
    transform: translateY(-50%);
    color: #222;
    background: #fff;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    font-size: 1.15rem;
    cursor: pointer;
    user-select: none;
}

.input-keyboard {
    position: fixed;
    bottom: 8vh;
    left: 0;
    width: 100%;
    box-sizing: border-box;
}
</style>