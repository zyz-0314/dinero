<template>
    <div class="grid">
        <div
            v-for="item in expenseCategories"
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
    name: 'ExpensePanel',
    props: {
        modelValue: String
    },
    emits: ['update:modelValue'],
    data() {
        return {
            expenseCategories: [
                { label: '餐饮', value: 'food'},
                { label: '交通', value: 'transport'},
                { label: '日常', value: 'daily'},
                { label: '运动', value: 'sports'},
                { label: '书籍', value: 'books'},
                { label: '数码', value: 'digital'},
                { label: '娱乐', value: 'entertain' },
                { label: '医疗', value: 'medical'},
                { label: '服饰', value: 'clothes'},
                { label: '旅行', value: 'travel'},
                { label: '其他', value: 'expense-others'},
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
/* 类名与IncomePanel.vue文件一样，css渲染在IncomePanel.vue可见 */
</style>