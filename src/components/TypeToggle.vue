<template>
    <div class="type-toggle">
        <div 
            class="slider"
            :style="{
                left: isIncome ? '50%' : '0',
                width: '50%',
                height: '100%'
            }"
        ></div>

        <div
            class="toggle-option expense-option"
            @click="switchToExpense"
        >
            <span :class="{ active: !isIncome }">支出</span>
        </div>
        <div
            class="toggle-option income-option"
            @click="switchToIncome"
        >
            <span :class="{ active: isIncome}">收入</span>
        </div>
    </div>
</template>

<script>
export default {
    name: 'TypeToggle',
    props: {
        modelValue: {
            type: String,
            required: true,
            validator: (val) => ['expense', 'income'].includes(val)
        }
    },
    emits: ['update:modelValue', 'toggle'],
    data() {
        return {
            isIncome: this.modelValue === 'income'
        }
    },
    watch: {
        //监听父组件值变化，同步内部状态
        modelValue(newVal) {
            this.isIncome = newVal === 'income'
        }
    },
    methods: {
        switchToExpense() {
            if(!this.isIncome) return;
            this.isIncome = false;
            this.$emit('update:modelValue', 'expense')
            this.$emit('toggle', 'expense')
        },
        switchToIncome() {
            if(this.isIncome) return;
            this.isIncome = true;
            this.$emit('update:modelValue', 'income')
            this.$emit('toggle', 'income')
        },
    }
}
</script>

<style>
.type-toggle {
    position: relative;
    width: 280px;
    height: 56px;
    margin: 0 auto;
    border-radius: 32px;
    border: 1px solid rgba(200, 200, 200, 0.2);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    background-color: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(12px);
    overflow: hidden;
}
.slider {
    position: absolute;
    top: 0;
    z-index: 1;
    border-radius: 32px;
    background: linear-gradient(135deg, #969696 0%, #605858 100%);
    box-shadow: 0 6px 16px rgba(36, 32, 32, 0.3);
    transition: left 0.4s cubic-bezier(0.25, 0.8, 0.25, 1),
                box-shadow 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.toggle-option {
    position: relative;
    z-index: 2;
    float: left;
    width: 50%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
}
.toggle-option span {
    font-size: 18px;
    font-weight: 500;
    color: #666;
    transition: color 0.3s ease;
}
.toggle-option span.active {
    color: #fff;
    font-weight: 600;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}
.toggle-option span:not(.active) {
    color: #888;
}
</style>