<template>
    <div class="grid">
        <div 
            v-for="item in foodCategories"
            :key="item.value"
            :class="{ selected: modelValue === item.value }"
            class="grid-item"
            @click="select(item.value)"
        >
            <div class="label">{{ item.label }}</div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'FoodPanel',
    props: {
        modelValue: String
    },
    emits: ['update:modelValue'],
    data() {
        return {
            foodCategories : [
                { label: '早饭', value: 'breakfast' },
                { label: '中饭', value: 'lunch' },
                { label: '晚饭', value: 'dinner' },
                { label: '水', value: 'water' },
                { label: '夜宵', value: 'late-night-snack' },
                { label: '零食', value: 'snacks' },
                { label: '饮品', value: 'drinks' }
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