<template>
    <div class="graph">
        <!-- 顶部收入/支出选择 -->
        <div class="graph-header-container">
            <TypeToggle v-model="recordType" />
        </div>

        <!-- 时间选择器 -->
        <div class="time-selector">
            <div class="period-tabs">
                <div
                    v-for="period in periods"
                    :key="period.value"
                    class="period-tab"
                    :class="{ active: selectedPeriod === period.value }"
                    @click="selectPeriod(period.value)"
                >
                    {{ period.label }}
                </div>
            </div>
        </div>

        <!-- 收入/支出折线图 -->
        <div class="chart-container">
            <div ref="chartRef" class="chart"></div>
        </div>

        <!-- 收入/支出饼状图 -->
        <div class="chart-container">
            <div class="chart-header">
                <div class="header-content">
                    <h3>{{ showSecondaryPie ? (currentPrimaryCategory === 'travel' ? '旅行子分类' : '餐饮子分类') : (recordType === 'income' ? '收入分类' : '支出分类') }}</h3>
                    <button v-if="showSecondaryPie" class="back-button" @click="backToPrimaryPie">返回</button>
                </div>
            </div>
            <div ref="pieChartRef" class="chart"></div>
        </div>
    </div>
</template>

<script>
import TypeToggle from '@/components/TypeToggle.vue';
import * as echarts from 'echarts';
import { isValidDate } from '@/utils/time';

export default {
    name: 'GraphView',
    components: {
        TypeToggle
    },
    data() {
        return {
            selectedPeriod: 'week', //默认选中周
            selectedWeek: 'current', //默认选中本周
            recordType: 'expense', //默认显示支出
            periods: [
                {label: '周', value: 'week'},
                {label: '月', value: 'month'},
                {label: '年', value: 'year'}
            ],
            chartInstance: null,
            pieChartInstance: null,
            chartData: [],
            showSecondaryPie: false, //是否显示二级饼状图
            currentPrimaryCategory: null //当前一级分类
        }
    },
    mounted() {
        this.initChart()
        this.initPieChart()
        this.loadChartData()
    },
    beforeUnmount() {
        if(this.chartInstance) {
            this.chartInstance.dispose()
            this.chartInstance = null
        }
        if(this.pieChartInstance) {
            this.pieChartInstance.dispose()
            this.pieChartInstance = null
        }
    },
    watch: {
        selectedPeriod() {
            this.loadChartData()
        },
        recordType() {
            this.loadChartData()
        }
    },
    methods: {
        selectPeriod(period){
            this.selectedPeriod = period
        },
        initChart() {
            this.chartInstance = echarts.init(this.$refs.chartRef)
        },
        initPieChart() {
            this.pieChartInstance = echarts.init(this.$refs.pieChartRef)
        },
        loadChartData() {
            //从localStorage获取数据
            const storedRecords = localStorage.getItem('recordDetailList');
            if(storedRecords) {
                const records = JSON.parse(storedRecords)
                this.processChartData(records)
            } else {
                //如果没有数据，生成默认数据
                this.processChartData([])
            }
        },
        processChartData(records) {
            //过滤有效数据
            const validRecords = records.filter(record => {
                return isValidDate(record.date) && !isNaN(Number(record.amount))
            })

            //根据选择的时间范围和记录类型处理数据
            let xAxisData = []
            let seriedData = []
            const now = new Date()
            
            //处理周数据
            if(this.selectedPeriod === 'week') {
                //生成近七天的日期
                for(let i=6; i>=0; i--) {
                    const date = new Date(now)
                    date.setDate(date.getDate()-i)
                    const dateStr = date.toISOString().split('T')[0]
                    xAxisData.push(dateStr)

                    //计算当日收入/支出
                    const dayRecords = validRecords.filter(record => {
                        const recordDate = new Date(record.date).toISOString().split('T')[0]
                        return recordDate === dateStr && record.type === this.recordType
                    })
                    const dayAmount = dayRecords.reduce((sum, record) => sum + record.amount, 0)
                    seriedData.push(dayAmount)
                }
            }

            //处理月数据
            else if(this.selectedPeriod === 'month') {
                //生成当月的周数据
                for(let i=0; i<4; i++) {
                    const weekStart = new Date(now.getFullYear(), now.getMonth(), 1 + i * 7)
                    const weekEnd = new Date(now.getFullYear(), now.getMonth(), 7 + i * 7)
                    const weekLabel = `第${i+1}周`
                    xAxisData.push(weekLabel)

                    //计算当周收入/支出
                    const weekRecords = validRecords.filter(record => {
                        const recordDate = new Date(record.date)
                        return recordDate >= weekStart && recordDate <= weekEnd && record.type === this.recordType
                    })
                    const weekAmount = weekRecords.reduce((sum, record) => sum + record.amount, 0)
                    seriedData.push(weekAmount)
                }
            }

            //处理年数据
            else if(this.selectedPeriod === 'year') {
                //生成当年的月份数据
                for(let i=0; i<12; i++) {
                    const monthLabel = `${i+1}月`
                    xAxisData.push(monthLabel)

                    //计算当月收入/支出
                    const monthRecords = validRecords.filter(record => {
                        const recordDate = new Date(record.date)
                        return recordDate.getMonth() === i && recordDate.getFullYear() === now.getFullYear() && record.type === this.recordType
                    })
                    const monthAmount = monthRecords.reduce((sum, record) => sum + record.amount, 0)
                    seriedData.push(monthAmount)
                }
            }

            //更新图表
            this.updateChart(xAxisData, seriedData)
            //更新饼状图
            this.updatePieChart(validRecords)
        },
        updateChart(xAxisData, seriedData) {
            if(!this.chartInstance) return

            const option = {
                tooltip: {
                    trigger: 'axis',
                    formatter: function(params) {
                        if (!params || params.length === 0) return ''
                        const param = params[0]
                        return param.name + '<br/>' + param.seriesName + ': ' + param.value.toFixed(2)
                    },
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    borderColor: '#333',
                    borderWidth: 1,
                    padding: 10,
                    textStyle: {
                        color: '#fff',
                        fontSize: 14
                    },
                    axisPointer: {
                        type: 'cross',
                        snap: true
                    }
                },
                xAxis: {
                    type: 'category',
                    data: xAxisData,
                    axisLabel: {
                        rotate: 45
                    }
                },
                yAxis: {
                    type: 'value'
                },
                series: [{
                    name: this.recordType === 'income' ? '收入' : '支出',
                    data: seriedData,
                    type: 'line',
                    smooth: true,
                    symbol: 'circle',
                    symbolSize: 8,
                    lineStyle: {
                        width: 3
                    },
                    itemStyle: {
                        color: this.recordType === 'income' ? '#f0ff7c' : '#a9caecb8'
                    },
                    areaStyle: {
                        color: {
                            type: 'linear',
                            x: 0,
                            y: 0,
                            x2: 0,
                            y2: 1,
                            colorStops: [{
                                offset: 0, color: this.recordType === 'income' ? 'rgba(52, 199, 89, 0.3)' : 'rgba(255, 59, 48, 0.3)'
                            }, {
                                offset: 1, color: this.recordType === 'income' ? 'rgba(52, 199, 89, 0.1)' : 'rgba(255, 59, 48, 0.1)'
                            }]
                        }
                    }
                }]
            }

            this.chartInstance.setOption(option)
        },
        updatePieChart(records) {
            if(!this.pieChartInstance) return

            //按分类分组数据
            const categoryMap = {}
            
            if (this.showSecondaryPie) {
                if (this.currentPrimaryCategory === 'travel') {
                    // 显示二级饼状图（旅行子分类）
                    records.forEach(record => {
                        if(record.type === this.recordType) {
                            // 只处理旅行相关的子分类
                            const categoryKey = record.category
                            if(record.type === 'expense' && (categoryKey.startsWith('trip') || ['tickets', 'specialist'].includes(categoryKey))) {
                                if(!categoryMap[categoryKey]) {
                                    categoryMap[categoryKey] = 0
                                }
                                categoryMap[categoryKey] += record.amount
                            }
                        }
                    })
                } else if (this.currentPrimaryCategory === 'food') {
                    // 显示二级饼状图（餐饮子分类）
                    records.forEach(record => {
                        if(record.type === this.recordType) {
                            // 只处理餐饮相关的子分类
                            const categoryKey = record.category
                            if(record.type === 'expense' && ['breakfast', 'lunch', 'dinner', 'water', 'late-night-snack', 'snacks', 'drinks'].includes(categoryKey)) {
                                if(!categoryMap[categoryKey]) {
                                    categoryMap[categoryKey] = 0
                                }
                                categoryMap[categoryKey] += record.amount
                            }
                        }
                    })
                }
            } else {
                // 显示一级饼状图
                records.forEach(record => {
                    if(record.type === this.recordType) {
                        // 将旅行子分类归类为旅行
                        let categoryKey = record.category
                        if(record.type === 'expense' && (categoryKey.startsWith('trip') || ['tickets', 'specialist'].includes(categoryKey))) {
                            categoryKey = 'travel'
                        }
                        // 将餐饮子分类归类为餐饮
                        if(record.type === 'expense' && ['breakfast', 'lunch', 'dinner', 'water', 'late-night-snack', 'snacks', 'drinks'].includes(categoryKey)) {
                            categoryKey = 'food'
                        }
                        if(!categoryMap[categoryKey]) {
                            categoryMap[categoryKey] = 0
                        }
                        categoryMap[categoryKey] += record.amount
                    }
                })
            }
            
            //对金额进行四舍五入，保留两位小数
            Object.keys(categoryMap).forEach(category => {
                categoryMap[category] = parseFloat(categoryMap[category].toFixed(2))
            })

            //转换为饼状图数据格式
            const pieData = Object.entries(categoryMap).map(([category, amount]) => ({
                name: this.getCategoryLabel(category),
                value: amount,
                categoryKey: category // 保存原始分类键
            }))

            //定义颜色映射
            const colorMap = {
                //支出分类颜色
                food: '#FF6384',
                breakfast: '#FF8A80',
                lunch: '#FF5252',
                dinner: '#D32F2F',
                water: '#4FC3F7',
                'late-night-snack': '#FFA726',
                snacks: '#FFD54F',
                drinks: '#FF9800',
                transport: '#36A2EB',
                daily: '#FFCE56',
                sports: '#4BC0C0',
                books: '#9966FF',
                digital: '#FF9F40',
                entertain: '#FF6D00',
                medical: '#8AC007',
                clothes: '#FF6B6B',
                travel: '#4ECDC4',
                tripFare: '#45B7D1',
                tripAccomodation: '#26A69A',
                tripTransport: '#7E57C2',
                tripFood: '#FFA726',
                tickets: '#EC407A',
                specialist: '#AB47BC',
                tripOthers: '#78909C',
                'expense-others': '#6C757D',
                //收入分类颜色
                allowance: '#4CAF50',
                bonus: '#2196F3',
                salary: '#FF9800',
                'second-job': '#7986CB',
                unused: '#9C27B0',
                envelope: '#E91E63',
                'income-others': '#607D8B'
            }

            //生成颜色数组
            const colors = pieData.map(item => {
                return colorMap[item.categoryKey] || '#999'
            })

            const option = {
                //鼠标悬停时呈现该部分具体金额数值
                tooltip: {
                    trigger: 'item',
                    formatter: '{b}: {c} ({d}%)'
                },
                legend: {
                    orient: 'horizontal',
                    bottom: 10,
                    data: pieData.map(item => item.name)
                },
                color: colors,
                series: [{
                    name: this.showSecondaryPie ? 
                        (this.currentPrimaryCategory === 'travel' ? '旅行子分类' : '餐饮子分类') : 
                        (this.recordType === 'income' ? '收入分类' : '支出分类'),
                    type: 'pie',
                    radius: '60%',
                    center: ['50%', '45%'],
                    data: pieData,
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    },
                    // 添加点击事件
                    itemStyle: {
                        borderRadius: 10,
                        borderColor: '#fff',
                        borderWidth: 2
                    },
                    label: {
                        show: true,
                        formatter: '{b}: {c}'
                    },
                    labelLine: {
                        show: true
                    }
                }]
            }

            this.pieChartInstance.setOption(option)
            
            // 添加点击事件监听
            this.pieChartInstance.off('click')
            this.pieChartInstance.on('click', (params) => {
                if (this.showSecondaryPie) {
                    // 从二级饼状图返回一级饼状图
                    this.showSecondaryPie = false
                    this.currentPrimaryCategory = null
                    this.loadChartData()
                } else {
                    // 检查是否点击了旅行分类或餐饮分类
                    if (params.data.categoryKey === 'travel') {
                        this.showSecondaryPie = true
                        this.currentPrimaryCategory = 'travel'
                        this.loadChartData()
                    } else if (params.data.categoryKey === 'food') {
                        this.showSecondaryPie = true
                        this.currentPrimaryCategory = 'food'
                        this.loadChartData()
                    }
                }
            })
        },
        getCategoryLabel(category) {
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
            return this.recordType === 'expense' ? expenseMap[category] : incomeMap[category]
        },
        backToPrimaryPie() {
            this.showSecondaryPie = false
            this.currentPrimaryCategory = null
            this.loadChartData()
        }
    }
}
</script>

<style>
.graph-header-container {
    padding: 16px;
}

/* 周/月/年的时间范围选择 */
.time-selector {
  background: #f5f5f5;
  padding: 12px;
  border-radius: 16px;
  margin: 12px 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}
.period-tabs {
  display: flex;
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
.period-tab {
  flex: 1;
  text-align: center;
  padding: 12px 0;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #666;
  font-weight: 500;
  font-size: 14px;
  border: 1px solid #e0e0e0;
  margin: 0 -1px;
  position: relative;
  z-index: 1;
}
.period-tab:first-child {
  border-radius: 12px 0 0 12px;
  margin-left: 0;
}
.period-tab:last-child {
  border-radius: 0 12px 12px 0;
  margin-right: 0;
}
.period-tab:hover {
  background: #f0f0f0;
  color: #333;
}
.period-tab.active {
  background: linear-gradient(135deg, #969696 0%, #605858 100%);
  color: #fff;
  font-weight: 600;
  z-index: 2;
}

/* 折线图样式 */
.chart-container {
  margin: 16px auto;
  max-width: 800px;
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  position: relative;
  z-index: 1;
}
.chart {
  width: 100%;
  height: 300px;
  overflow: hidden;
}
.chart-header {
  margin-bottom: 10px;
}
.header-content {
  display: flex;
  align-items: center;
  position: relative;
}
.chart-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  text-align: center;
  width: 100%;
}
.back-button {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  background: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 4px 12px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}
.back-button:hover {
  background: #e0e0e0;
  border-color: #ccc;
}
</style>