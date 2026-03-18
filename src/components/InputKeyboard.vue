<template>
    <div class="input-keyboard">
        <!-- 金额显示区域 -->
        <div class="amount-display">{{ formattedAmount }}</div>
        
        <!-- 备注框及资产选择区域 -->
        <div class="remark-asset-container">
            <input
                type="text"
                class="remark-input"
                placeholder="备注"
                v-model="localRemark"
                @input="handleRemarkInput"
            />
            <!-- 资产选择区域 -->
            <div class="asset-section">
                <div 
                    v-for="asset in sortedAssets" 
                    :key="asset.id"
                    class="asset-option"
                    :class="{ active: selectedAssetId === asset.id }"
                    @click="selectAsset(asset.id)"
                >
                    {{ asset.name }}
                </div>
            </div>
        </div>
        <!-- 数字按键区域 -->
        <div class="keyboard-wrap">
            <button
                class="key"
                v-for="num in [1, 2, 3, 4, 5, 6, 7, 8, 9, '.',  0]"
                :key="num"
                @click="handleKeyClick(num)"
            >
                {{ num }}
            </button>
            <!-- 删除按键 -->
            <button class="key key-delete" @click="handleDelete">
                <span class="delete-btn">⌫</span>
            </button>
            <!-- 日期选择按键 -->
            <input type="date" class="key key-date" v-model="localSelectedDate" @change="handleDateChange" :max="today" />
            <!-- 无用空格，把确认键顶到最右边 -->
            <div class="key key-meaningless"></div>
            <!-- 确认按键 -->
            <button class="key key-confirm" @click="handleConfirm">
                <span class="confirm-btn">确认</span>
            </button>
        </div>
    </div>
</template>

<script>
import { getTodayDate, isValidDate } from '@/utils/time';

export default {
    name: 'InputKeyboard',
    emits: ['key-press', 'delete', 'date-change', 'update:amount', 'update:remark', 'update:selectedAssetId', 'confirm'], //定义向外触发的事件
    props: {
        amount: {
            type: String,
            default: '0'
        },
        remark: {
            type: String,
            default: ''
        },
        selectedDate: {
            type: String,
            default: ''
        },
        assets: {
            type: Array,
            default: () => []
        },
        selectedAssetId: {
            type: [Number, String],
            default: null
        }
    },
    data() {
        return {
            today: '',
            localRemark: this.remark,
            localAmount: this.amount ? String(this.amount) : '0',
            localSelectedDate: this.selectedDate || '',
            localSelectedAssetId: this.selectedAssetId || null
        }
    },
    watch: {
        amount(newVal) {
            this.localAmount = newVal ? String(newVal) : '0'
        },
        remark(newVal) {
            this.localRemark = newVal || ''
        },
        selectedDate(newVal) {
            this.localSelectedDate = newVal || ''
        },
        assets() {
            // 当资产列表变化时，更新本地资产列表
        },
        selectedAssetId(newVal) {
            this.localSelectedAssetId = newVal || null
        }
    },
    computed: {
        //格式化金额显示
        formattedAmount() {
            if(!this.localAmount) return '0.00'
            const [integer, decimal = '00'] = this.localAmount.split('.')
            const fixedDecimal = decimal.padEnd(2, '0').slice(0, 2)
            const intPart = integer || '0'
            return `${intPart}.${fixedDecimal}`
        },
        // 按优先级排序的资产列表
        sortedAssets() {
            return [...this.assets].sort((a, b) => (a.priority || 999) - (b.priority || 999))
        }
    },  
    created() {
        this.today = getTodayDate()
        //如果没有传入selectedDate，则使用当前日期
        if (!this.localSelectedDate) {
            this.localSelectedDate = this.today
        }
        this.$emit('date-change', this.localSelectedDate)
    },
    methods: {
        //数字键点击，更新本地金额并发送给父组件
        handleKeyClick(num) {
            if(num === '.' && this.localAmount.includes('.')) return //禁止重复输入小数点
            if(this.localAmount === '0') {
                this.localAmount = num === '.' ? '0.' : num.toString()
            } else {
                const[, decimal] = this.localAmount.split('.')
                if(decimal && decimal.length >= 2) return
                this.localAmount += num.toString()
            }
            this.$emit('update:amount', this.localAmount)
            this.$emit('key-press', num);
        },
        //删除键点击，更新本地金额并发送
        handleDelete() {
            if(this.localAmount.length <= 1 || this.localAmount === '0') {
                this.localAmount = '0'
            } else {
                this.localAmount = this.localAmount.slice(0, -1)
            }
            this.$emit('update:amount', this.localAmount)
            this.$emit('delete');
        },
        //日期选择点击
        handleDateChange() {
            if(!isValidDate(this.localSelectedDate)) {
                alert('请选择有效的日期格式')
                this.localSelectedDate = this.today //重置为今日
                return
            }
            this.$emit('date-change', this.localSelectedDate)
        },
        //输入备注
        handleRemarkInput() {
            this.$emit('update:remark', this.localRemark || '')
        },
        //选择资产
        selectAsset(assetId) {
            this.localSelectedAssetId = assetId;
            this.$emit('update:selectedAssetId', assetId);
        },
        //确认键点击
        handleConfirm() {
            this.$emit('confirm', {
                date: this.localSelectedDate,
                selectedAssetId: this.localSelectedAssetId
            });
        }
    }
};
</script>

<style>
.input-keyboard {
    padding: 10px;
    background: #f5f5f5;
    border-radius: 8px;
}
.amount-display {
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 8px;
    color: #333;
}
.remark-asset-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}
.remark-input {
    flex: 1;
    padding: 8px;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    font-size: 14px;
    margin-right: 12px;
}
.asset-section {
    display: flex;
    gap: 8px;
}
.asset-option {
    padding: 6px 12px;
    background: #fff;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
}
.asset-option:hover {
    border-color: #ffc107;
}
.asset-option.active {
    background: #ffeb3b;
    border-color: #ffc107;
    color: #333;
}
.keyboard-wrap {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
}
.keyboard-wrap button {
    color: #999;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    transition: all 0.3s ease;
}
.keyboard-wrap button:hover {
    transform: scale(1.05);
}
.key {
    height: 48px;
    font-size: 18px;
    border: none;
    border-radius: 6px;
    background: #fff;
    cursor: pointer;
}
.key-date {
    font-family: '微软雅黑', sans-serif;
    color: #999;
    font-weight: 500;
}
.key-delete, .key-confirm {
    grid-column: span 1.5;
}
.key-meaningless {
    background: #f5f5f5;
}
.key-confirm {
    background: linear-gradient(135deg, #969696 0%, #605858 100%);
    color: #fff;
}
</style>