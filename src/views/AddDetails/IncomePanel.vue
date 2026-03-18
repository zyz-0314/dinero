<template>
    <div class="grid">
        <div
            v-for="item in incomeCategories"
            :key="item.value"
            class="grid-item"
            :class="{ selected: modelValue === item.value }"
            @click="select(item.value)"
        >
            <div class="label">{{ item.label }}</div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'IncomePanel',
    props: {
        modelValue: String
    },
    emits: ['update:modelValue'],
    data() {
        return {
            incomeCategories: [
                { label: '生活费', value: 'allowance'},
                { label: '奖金', value: 'bonus'},
                { label: '工资', value: 'salary'},
                { label: '副业', value: 'second-job' },
                { label: '闲置', value: 'unused'},
                { label: '红包', value: 'envelope'},
                { label: '其他', value: 'income-others'},
            ]
        }
    },
    methods: {
        select(value) {
            this.$emit('update:modelValue', value)
        }
    }
}
</script>

<style>
.grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    padding: 16px;
}
.grid-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 80px;
    font-weight: 500;
    color: #999;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    cursor: pointer;
    user-select: none;
    transition: all 0.3s ease;
}
.grid-item:hover {
    transform: scale(1.05);
}
.grid-item.selected {
    background: linear-gradient(135deg, #474747 0%, #252423 100%);
    color: #999;
    box-shadow: 0 4px 12px rgba(28, 28, 27, 0.3);
}
</style>