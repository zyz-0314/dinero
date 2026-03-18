<template>
    <div class="assets-container">
        <div class="assets-header">
            <h2>资产管家</h2>
        </div>
        
        <div class="net-assets-card">
            <div class="net-assets-title">总资产</div>
            <div class="net-assets-amount">{{ netAssets.toFixed(2) }}</div>
        </div>
        
        <!-- 资产分类列表 -->
        <div class="assets-list">
            <!-- 现金分类 -->
            <div v-if="assets.filter(a => a.category === 'cash').length > 0" class="assets-category">
                <div class="category-header">
                    <span class="category-name">现金</span>
                    <span class="category-amount">{{ assets.filter(a => a.category === 'cash').reduce((sum, a) => sum + a.amount, 0).toFixed(2) }}</span>
                </div>
                <div class="category-items">
                    <div v-for="asset in assets.filter(a => a.category === 'cash')" :key="asset.id" class="asset-item">
                        <div class="asset-name">{{ asset.name }}</div>
                        <div class="asset-amount">{{ asset.amount.toFixed(2) }}</div>
                        <div class="asset-actions">
                            <span class="edit-btn" @click="openEditAsset(asset)">编辑</span>
                            <span class="delete-btn" @click="deleteAsset(asset.id)">删除</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- 银行分类 -->
            <div v-if="assets.filter(a => a.category === 'bank').length > 0" class="assets-category">
                <div class="category-header">
                    <span class="category-name">银行卡</span>
                    <span class="category-amount">{{ assets.filter(a => a.category === 'bank').reduce((sum, a) => sum + a.amount, 0).toFixed(2) }}</span>
                </div>
                <div class="category-items">
                    <div v-for="asset in assets.filter(a => a.category === 'bank')" :key="asset.id" class="asset-item">
                        <div class="asset-name">{{ asset.name }}</div>
                        <div class="asset-amount">{{ asset.amount.toFixed(2) }}</div>
                        <div class="asset-actions">
                            <span class="edit-btn" @click="openEditAsset(asset)">编辑</span>
                            <span class="delete-btn" @click="deleteAsset(asset.id)">删除</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- 虚拟账户分类 -->
            <div v-if="assets.filter(a => a.category === 'virtual').length > 0" class="assets-category">
                <div class="category-header">
                    <span class="category-name">虚拟账户</span>
                    <span class="category-amount">{{ assets.filter(a => a.category === 'virtual').reduce((sum, a) => sum + a.amount, 0).toFixed(2) }}</span>
                </div>
                <div class="category-items">
                    <div v-for="asset in assets.filter(a => a.category === 'virtual')" :key="asset.id" class="asset-item">
                        <div class="asset-name">{{ asset.name }}</div>
                        <div class="asset-amount">{{ asset.amount.toFixed(2) }}</div>
                        <div class="asset-actions">
                            <span class="edit-btn" @click="openEditAsset(asset)">编辑</span>
                            <span class="delete-btn" @click="deleteAsset(asset.id)">删除</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- 添加资产按钮 -->
        <div class="add-asset-btn" @click="openAddAsset">
            + 添加资产
        </div>
        
        <!-- 调整优先级按钮 -->
        <div class="add-asset-btn" @click="openPriorityModal">
            调整资产优先级
        </div>
        
        <!-- 添加资产模态框 -->
        <div v-if="showAddAsset" class="modal-overlay active"></div>
        <div v-if="showAddAsset" class="add-asset-modal">
            <div class="add-asset-header">
                <h3>添加资产</h3>
                <span class="close-btn" @click="closeAddAsset">×</span>
            </div>
            <div class="add-asset-content">
                <div class="form-group">
                    <label>资产名称</label>
                    <input v-model="newAsset.name" type="text" placeholder="请输入资产名称" class="form-input">
                </div>
                <div class="form-group">
                    <label>资产金额</label>
                    <input v-model.number="newAsset.amount" type="number" placeholder="请输入资产金额" class="form-input" min="0" step="0.01">
                </div>
                <div class="form-group">
                    <label>资产分类</label>
                    <select v-model="newAsset.category" class="form-select">
                        <option value="cash">现金</option>
                        <option value="bank">银行</option>
                        <option value="virtual">微信</option>
                        <option value="virtual">支付宝</option>
                        <option value="virtual">其他虚拟账户</option>
                    </select>
                </div>
            </div>
            <div class="add-asset-footer">
                <button class="cancel-btn" @click="closeAddAsset">取消</button>
                <button class="confirm-btn" @click="confirmAddAsset">确认</button>
            </div>
        </div>
        
        <!-- 编辑资产模态框 -->
        <div v-if="showEditAsset" class="modal-overlay active"></div>
        <div v-if="showEditAsset" class="add-asset-modal">
            <div class="add-asset-header">
                <h3>编辑资产</h3>
                <span class="close-btn" @click="closeEditAsset">×</span>
            </div>
            <div class="add-asset-content">
                <div class="form-group">
                    <label>资产名称</label>
                    <input v-model="editingAsset.name" type="text" class="form-input" disabled>
                </div>
                <div class="form-group">
                    <label>资产金额</label>
                    <input v-model.number="editAssetAmount" type="number" placeholder="请输入资产金额" class="form-input" min="0" step="0.01">
                </div>
                <div class="form-group">
                    <label>资产分类</label>
                    <input :value="getCategoryName(editingAsset.category)" type="text" class="form-input" disabled>
                </div>
            </div>
            <div class="add-asset-footer">
                <button class="cancel-btn" @click="closeEditAsset">取消</button>
                <button class="confirm-btn" @click="confirmEditAsset">确认</button>
            </div>
        </div>
        
        <!-- 调整优先级模态框 -->
        <div v-if="showPriorityModal" class="modal-overlay active"></div>
        <div v-if="showPriorityModal" class="add-asset-modal">
            <div class="add-asset-header">
                <h3>调整资产优先级</h3>
                <span class="close-btn" @click="closePriorityModal">×</span>
            </div>
            <div class="add-asset-content">
                <div class="priority-list">
                    <div 
                        v-for="(asset, index) in tempPrioritizedAssets" 
                        :key="asset.id"
                        class="priority-item"
                    >
                        <div class="priority-handle" @mousedown="startDrag(index, $event)">
                            ☰
                        </div>
                        <div class="priority-asset-name">{{ asset.name }}</div>
                        <div class="priority-number">{{ index + 1 }}</div>
                    </div>
                </div>
            </div>
            <div class="add-asset-footer">
                <button class="cancel-btn" @click="closePriorityModal">取消</button>
                <button class="confirm-btn" @click="confirmPriority">确认</button>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'MyAssetsDetail',
    data() {
        return {
            totalAssets: 0,
            netAssets: 0,
            showAddAsset: false,
            showPriorityModal: false,
            tempPrioritizedAssets: [],
            assets: [
                {
                    id: 1,
                    name: '微信',
                    amount: 0,
                    category: 'virtual',
                    priority: 1
                },
                {
                    id: 2,
                    name: '支付宝',
                    amount: 0,
                    category: 'virtual',
                    priority: 2
                },
                {
                    id: 3,
                    name: '',
                    amount: 0,
                    category: 'bank',
                    priority: 3
                },
                {
                    id: 4,
                    name: '',
                    amount: 0,
                    category: 'cash',
                    priority: 4
                }
            ],
            newAsset: {
                name: '',
                amount: 0,
                category: 'cash'
            },
            editingAsset: null,
            showEditAsset: false,
            editAssetAmount: 0,
            //拖拽相关
            isDragging: false,
            dragIndex: null
        }
    },
    created() {
        this.loadAssets()
        this.calculateAssets()
    },
    computed: {
        //按优先级排序的资产列表
        prioritizedAssets() {
            return [...this.assets].sort((a, b) => (a.priority || 999) - (b.priority || 999))
        }
    },
    methods: {
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
                // 确保每个资产都有priority字段
                this.assets.forEach((asset, index) => {
                    if (asset.priority === undefined) {
                        asset.priority = index + 1
                    }
                })
            }
        },
        //保存资产数据
        saveAssets() {
            localStorage.setItem('assets', JSON.stringify(this.assets))
        },
        //获取分类名称
        getCategoryName(category) {
            const categoryMap = {
                cash: '现金',
                bank: '银行',
                virtual: '虚拟账户'
            }
            return categoryMap[category] || category
        },
        //打开添加资产模态框
        openAddAsset() {
            this.showAddAsset = true
        },
        //关闭添加资产模态框
        closeAddAsset() {
            this.showAddAsset = false
            this.resetNewAsset()
        },
        //重置新资产表单
        resetNewAsset() {
            this.newAsset = {
                name: '',
                amount: 0,
                category: 'cash'
            }
        },
        //确认添加资产
        confirmAddAsset() {
            if(this.newAsset.amount > 0) {
                // 获取选中的选项文本，用于设置资产名称
                let assetName = this.newAsset.name
                if(!assetName) {
                    // 根据分类和金额设置默认名称
                    if(this.newAsset.category === 'virtual' && this.newAsset.amount > 0) {
                        // 检查是否已经有微信或支付宝
                        const hasWechat = this.assets.some(a => a.name === '微信' && a.category === 'virtual')
                        const hasAlipay = this.assets.some(a => a.name === '支付宝' && a.category === 'virtual')
                        if(!hasWechat) {
                            assetName = '微信'
                        } else if (!hasAlipay) {
                            assetName = '支付宝'
                        } else {
                            assetName = '其他虚拟账户'
                        }
                    } else {
                        assetName = this.getCategoryName(this.newAsset.category)
                    }
                }
                const newAssetItem = {
                    id: Date.now(),
                    name: assetName,
                    amount: parseFloat(this.newAsset.amount),
                    category: this.newAsset.category,
                    priority: this.assets.length + 1 // 新资产默认优先级为最后
                }
                this.assets.push(newAssetItem)
                this.calculateAssets()
                this.saveAssets()
                this.closeAddAsset()
            }
        },
        //删除资产
        deleteAsset(id) {
            this.assets = this.assets.filter(asset => asset.id !== id)
            this.calculateAssets()
            this.saveAssets()
        },
        //打开编辑资产模态框
        openEditAsset(asset) {
            this.editingAsset = asset
            this.editAssetAmount = asset.amount
            this.showEditAsset = true
        },
        //关闭编辑资产模态框
        closeEditAsset() {
            this.showEditAsset = false
            this.editingAsset = null
            this.editAssetAmount = 0
        },
        //确认编辑资产
        confirmEditAsset() {
            if (this.editingAsset && this.editAssetAmount > 0) {
                this.editingAsset.amount = parseFloat(this.editAssetAmount)
                this.calculateAssets()
                this.saveAssets()
                this.closeEditAsset()
            }
        },
        //打开优先级调整模态框
        openPriorityModal() {
            this.tempPrioritizedAssets = [...this.prioritizedAssets]
            this.showPriorityModal = true
        },
        //关闭优先级调整模态框
        closePriorityModal() {
            this.showPriorityModal = false
        },
        //开始拖拽
        startDrag(index, event) {
            event.preventDefault()
            this.isDragging = true
            this.dragIndex = index
            document.addEventListener('mousemove', this.onDrag)
            document.addEventListener('mouseup', this.stopDrag)
        },
        //拖拽过程
        onDrag(event) {
            if(!this.isDragging) return
            
            const priorityList = document.querySelector('.priority-list')
            const items = priorityList.querySelectorAll('.priority-item')
            let targetIndex = this.dragIndex
            
            //计算鼠标位置对应的目标索引
            for(let i = 0; i < items.length; i++) {
                const rect = items[i].getBoundingClientRect()
                if(event.clientY >= rect.top && event.clientY <= rect.bottom) {
                    targetIndex = i
                    break
                }
            }
            
            //交换位置
            if(targetIndex !== this.dragIndex) {
                const temp = this.tempPrioritizedAssets[this.dragIndex]
                this.tempPrioritizedAssets.splice(this.dragIndex, 1)
                this.tempPrioritizedAssets.splice(targetIndex, 0, temp)
                this.dragIndex = targetIndex
            }
        },
        //停止拖拽
        stopDrag() {
            this.isDragging = false
            this.dragIndex = null
            document.removeEventListener('mousemove', this.onDrag)
            document.removeEventListener('mouseup', this.stopDrag)
        },
        //确认优先级调整
        confirmPriority() {
            //更新资产的优先级
            this.tempPrioritizedAssets.forEach((asset, index) => {
                const originalAsset = this.assets.find(a => a.id === asset.id)
                if(originalAsset) {
                    originalAsset.priority = index + 1
                }
            })
            
            //保存资产数据
            this.saveAssets()
            
            //关闭模态框
            this.closePriorityModal()
        }
    }
}
</script>

<style scoped>
.assets-container {
    padding: 16px;
    max-width: 600px;
    margin: 0 auto;
}
.assets-header {
    margin-bottom: 24px;
}
.assets-header h2 {
    font-size: 24px;
    font-weight: 600;
    color: #333;
    text-align: center;
}

/* 总资产卡片 */
.net-assets-card {
    background: #fff;
    color: white;
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 24px;
    text-align: center;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
.net-assets-title {
    font-size: 16px;
    opacity: 0.9;
    margin-bottom: 8px;
}
.net-assets-amount {
    font-size: 32px;
    font-weight: 600;
}

/* 资产明细列表 */
.assets-list {
    background: #fff;
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    margin-bottom: 24px;
}
.assets-category {
    margin-bottom: 24px;
}
.assets-category:last-child {
    margin-bottom: 0;
}
.category-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid #f0f0f0;
}
.category-name {
    font-size: 16px;
    font-weight: 500;
    color: #333;
}
.category-amount {
    font-size: 16px;
    font-weight: 600;
    color: #4c94ff;
}
.category-items {
    display: flex;
    flex-direction: column;
    gap: 8px;
}
.asset-item {
    display: flex;
    align-items: center;
    padding: 12px;
    background: #f9f9f9;
    border-radius: 8px;
    transition: all 0.3s ease;
}
.asset-item:hover {
    background: #f0f0f0;
}
.asset-name {
    flex: 1;
    font-size: 14px;
    color: #333;
}
.asset-amount {
    font-size: 14px;
    font-weight: 500;
    color: #333;
    margin-right: 16px;
}
.asset-actions {
    margin-left: auto;
}

/* 编辑资产明细按键 */
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

/* 删除资产明细按键 */
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

/* 添加资产明细按键 */
.add-asset-btn {
    margin: 16px;
    padding: 16px;
    background: #fff;
    border: 2px dashed 4c94ff;
    border-radius: 12px;
    text-align: center;
    color: 4c94ff;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
}
.add-asset-btn:hover {
    background: rgba(102, 126, 234, 0.05);
    transform: translateY(-2px);
}

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: none;
    z-index: 1000;
}
.modal-overlay.active {
    display: block;
}

/* 添加资产明细模态框 */
.add-asset-modal {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #fff;
    border-radius: 12px;
    width: 90%;
    max-width: 400px;
    z-index: 1001;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}
.add-asset-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid #f0f0f0;
}
.add-asset-header h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #333;
}
.close-btn {
    font-size: 24px;
    cursor: pointer;
    color: #999;
    line-height: 1;
}
.close-btn:hover {
    color: #333;
}
.add-asset-content {
    padding: 20px;
}

.form-group {
    margin-bottom: 16px;
}
.form-group label {
    display: block;
    margin-bottom: 8px;
    font-size: 14px;
    font-weight: 500;
    color: #333;
}
.form-input,
.form-select {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 14px;
    transition: all 0.3s ease;
}
.form-input:focus,
.form-select:focus {
    outline: none;
    border-color: #4c94ff;
    box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
}
.form-input:disabled {
    background: #f5f5f5;
    color: #999;
}

.add-asset-footer {
    display: flex;
    justify-content: flex-end;
    padding: 16px 20px;
    border-top: 1px solid #f0f0f0;
    gap: 12px;
}

.cancel-btn {
    padding: 8px 16px;
    border: 1px solid #ddd;
    border-radius: 6px;
    background: #fff;
    color: #333;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.cancel-btn:hover {
    background: #f5f5f5;
}

.confirm-btn {
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
    background: #4c94ff;
    color: #fff;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.confirm-btn:hover {
    background: #4c94ff;
}

/* 优先级调整模态框样式 */
.priority-list {
    max-height: 300px;
    overflow-y: auto;
}
.priority-item {
    display: flex;
    align-items: center;
    padding: 12px;
    background: #f9f9f9;
    border-radius: 8px;
    margin-bottom: 8px;
    cursor: move;
    transition: all 0.3s ease;
}
.priority-item:hover {
    background: #f0f0f0;
}
.priority-handle {
    margin-right: 12px;
    cursor: move;
    color: #999;
    font-size: 16px;
    user-select: none;
}
.priority-asset-name {
    flex: 1;
    font-size: 14px;
    color: #333;
}
.priority-number {
    font-size: 14px;
    font-weight: 500;
    color: #4c94ff;
    min-width: 20px;
    text-align: right;
}
</style>