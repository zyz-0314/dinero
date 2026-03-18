<template>
    <!-- 因为共享css属性和部分js函数，所以命名把edit改成add -->
    <div class="add-record">
        <div class="add-header-container">
            <button class="back-btn" @click="handleBack">返回</button>

            <TypeToggle v-model="recordType" />
        </div>

        <!-- 分类选项面板 -->
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
            :selected-date="selectedDate"
            :assets="assets"
            v-model:selectedAssetId="selectedAssetId"
            @update:selectedAssetId="val => selectedAssetId = val"
            class="input-keyboard"
        />
    </div>
</template>

<script>
import { isValidDate, isFutureDate } from '@/utils/time';
import TypeToggle from '@/components/TypeToggle.vue';
import ExpensePanel from './ExpensePanel.vue';
import IncomePanel from './IncomePanel.vue';
import TravelPanel from './TravelPanel.vue';
import FoodPanel from './FoodPanel.vue';
import router from '@/router';
import InputKeyboard from '@/components/InputKeyboard.vue';

export default {
    name: 'EditDetails',
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
            originalRecord: null,
            selectedDate: '',
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
            const intPart = integer || '0'
            return `${intPart}.${fixedDecimal}`
        }
    },
    created() {
        //从路由参数中获取要编辑的记录
        if(this.$route.query.record) {
            try {
                this.originalRecord = JSON.parse(this.$route.query.record);
                this.recordType = this.originalRecord.type;
                this.category = this.originalRecord.category;
                this.amount = this.originalRecord.amount.toString();
                this.recordDate = this.originalRecord.date;
                this.selectedDate = this.originalRecord.date;
                this.remark = this.originalRecord.remark || '';
                this.selectedAssetId = this.originalRecord.assetId || null;
                console.log('Record loaded:', this.originalRecord);
                console.log('Initial amount:', this.amount);
                console.log('Initial date:', this.selectedDate);
                console.log('Initial assetId:', this.selectedAssetId);
                // 加载资产数据
                this.loadAssets();
            } 
            catch(error) {
                console.error('解析记录失败:', error);
                router.push({ name: 'MoneyDetails' });
            }
        }
        else {
            console.error('No record found in query params');
            router.push({ name: 'MoneyDetails' });
        }
    },
    methods: {
        //加载资产数据
        loadAssets() {
            const storedAssets = localStorage.getItem('assets');
            if(storedAssets) {
                this.assets = JSON.parse(storedAssets);
                // 按优先级排序资产
                this.assets.sort((a, b) => (a.priority || 999) - (b.priority || 999));
                // 如果没有选中资产且资产列表不为空，默认选择优先级最高的资产
                if(!this.selectedAssetId && this.assets.length > 0) {
                    this.selectedAssetId = this.assets[0].id;
                }
            }
        },
        //返回
        handleBack() {
            router.go(-1);
        },

        //日期变更处理
        handleDateChange(date) {
            if(!date) return;
            this.recordDate = date;
            console.log("日期已更新为：", new Date(date).toLocaleDateString());
        },

        handleConfirm() {
            if(!this.category || this.amount === '0') {
                alert('请选择分类并输入有效金额');
                return;
            }

            if(!isValidDate(this.recordDate)) {
                alert('请选择有效日期');
                return;
            }

            if(isFutureDate(this.recordDate)) {
                alert('不可选择未来的时间日期');
                return;
            }

            if(!this.selectedAssetId) {
                alert('请选择资产来源');
                return;
            }
            
            //构造更新后的记录数据
            const updatedRecord = {
                ...this.originalRecord,
                type: this.recordType,
                category: this.category,
                amount: parseFloat(this.formattedAmount),
                remark: this.remark || '',
                date: new Date(this.recordDate).toISOString().split('T')[0],
                createTime: this.originalRecord.createTime, // 保持原始创建时间
                assetId: this.selectedAssetId // 添加资产ID
            };

            console.log("已更新记录：", updatedRecord);

            //从本地存储中获取所有记录
            const existingRecords = JSON.parse(localStorage.getItem('recordDetailList') || '[]');
            //找到并更新对应记录
            const updatedRecords = existingRecords.map(record => {
                //比较记录的关键属性来确定要更新的记录
                if(record.type === this.originalRecord.type &&
                   record.category === this.originalRecord.category &&
                   record.amount == this.originalRecord.amount &&
                   record.date === this.originalRecord.date &&
                   record.remark === this.originalRecord.remark) {
                    return updatedRecord;
                }
                return record;
            });
            //保存回本地存储
            localStorage.setItem('recordDetailList', JSON.stringify(updatedRecords));

            // 更新资产余额
            this.updateAssetBalance();

            //跳转回详情页并触发更新
            router.push({ name: 'MoneyDetails' }).then(() => {
                window.dispatchEvent(new Event('recordAdded'));
            });
        },
        //更新资产余额
        updateAssetBalance() {
            const originalAmount = this.originalRecord.amount;
            const originalAssetId = this.originalRecord.assetId;
            const newAmount = parseFloat(this.formattedAmount);
            const newAssetId = this.selectedAssetId;
            
            const storedAssets = localStorage.getItem('assets');
            if(storedAssets) {
                let assets = JSON.parse(storedAssets);
                
                //恢复原始记录的资产余额
                if(originalAssetId) {
                    const originalAssetIndex = assets.findIndex(asset => asset.id === originalAssetId);
                    if (originalAssetIndex !== -1) {
                        if (this.originalRecord.type === 'income') {
                            // 收入记录被修改，资产余额减少
                            assets[originalAssetIndex].amount -= originalAmount;
                        } else {
                            // 支出记录被修改，资产余额增加
                            assets[originalAssetIndex].amount += originalAmount;
                        }
                    }
                }
                
                //根据新记录更新资产余额
                const newAssetIndex = assets.findIndex(asset => asset.id === newAssetId);
                if(newAssetIndex !== -1) {
                    if(this.recordType === 'income') {
                        //收入记录，资产余额增加
                        assets[newAssetIndex].amount += newAmount;
                    }else {
                        //支出记录，资产余额减少
                        assets[newAssetIndex].amount -= newAmount;
                    }
                }
                
                //保存更新后的资产数据
                localStorage.setItem('assets', JSON.stringify(assets));
                console.log("资产余额已更新");
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