<template>
    <div class="grid">
        <div 
            v-for="item in travelCategories"
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
    name: 'TravelPanel',
    props: {
        modelValue: String
    },
    emits: ['update:modelValue'],
    data() {
        return {
            travelCategories : [
                { label: '路费', value: 'tripFare' },
                { label: '住宿', value: 'tripAccomodation' },
                { label: '交通', value: 'tripTransport' },
                { label: '餐饮', value: 'tripFood' },
                { label: '门票', value: 'tickets' },
                { label: '特产/纪念品', value: 'specialist' },
                { label: '其他', value: 'tripOthers' }
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