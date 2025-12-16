<template>
	<view class="page" :class="'theme-' + currentTheme">
		<view class="theme-toggle" @tap="toggleTheme">
			<text class="theme-icon">🎨</text>
		</view>
		<view class="content">
			<view class="row" v-for="role in roles" :key="role.key">
				<view class="role-icon-wrapper">
					<view class="role-icon" @longpress="onRoleIconLongPress(role.key)">
						<image class="role-img" :src="roleIcons[role.key]" mode="aspectFill" />
					</view>
					<view class="cd-changer-badges">
						<image v-if="getCdChangerState(role.key, 'cosmic')" class="cd-changer-badge" src="/static/cdChanger/CosmicInsight.png" mode="aspectFit" />
						<image v-if="getCdChangerState(role.key, 'shoe')" class="cd-changer-badge" src="/static/cdChanger/shoe.png" mode="aspectFit" />
					</view>
				</view>
				<view class="skills">
					<view class="skill-box" @tap="onSkillTap(role.key, 0)" @dblclick="onSkillDoubleClick(role.key, 0)" @longpress="onSkillLongPress(role.key, 0)" @contextmenu.prevent="onSkillRightClick(role.key, 0)">
						<image v-if="spells[role.key][0]" class="skill-img" :class="{ 'start-anim': isAnimating(role.key, 0) }" :src="spellIcons[spells[role.key][0]]" mode="aspectFill" />
						<view v-if="getRemain(role.key, 0) > 0" class="cd-overlay" :class="{ 'start-anim-overlay': isAnimating(role.key, 0) }"></view>
						<text v-if="getRemain(role.key, 0) > 0" class="cd-text" :class="{ 'start-anim-num': isAnimating(role.key, 0) }">{{ getRemain(role.key, 0) }}</text>
					</view>
					<view class="skill-box" @tap="onSkillTap(role.key, 1)" @dblclick="onSkillDoubleClick(role.key, 1)" @longpress="onSkillLongPress(role.key, 1)" @contextmenu.prevent="onSkillRightClick(role.key, 1)">
						<image v-if="spells[role.key][1]" class="skill-img" :class="{ 'start-anim': isAnimating(role.key, 1) }" :src="spellIcons[spells[role.key][1]]" mode="aspectFill" />
						<view v-if="getRemain(role.key, 1) > 0" class="cd-overlay" :class="{ 'start-anim-overlay': isAnimating(role.key, 1) }"></view>
						<text v-if="getRemain(role.key, 1) > 0" class="cd-text" :class="{ 'start-anim-num': isAnimating(role.key, 1) }">{{ getRemain(role.key, 1) }}</text>
					</view>
				</view>
				<view class="equip-box">
					<scroll-view class="equip-scroll" scroll-x="true" show-scrollbar="false">
						<view class="equip-list">
							<template v-for="idx in 5" :key="idx">
								<template v-if="getEquipAtSlot(role.key, idx - 1)">
									<!-- 如果有装备，显示装备 -->
									<view class="equip-item" @tap="onEquipTap(role.key, idx - 1)" @dblclick="onEquipDblClick(role.key, idx - 1)" @longpress="onEquipLongPress(role.key, idx - 1)" @contextmenu.prevent="onEquipRightClick(role.key, idx - 1)">
										<image class="equip-img" :class="{ 'start-anim': isEquipAnimating(role.key, idx - 1) }" :src="equipIcons[getEquipAtSlot(role.key, idx - 1)]" mode="aspectFill" />
										<view v-if="getEquipRemain(role.key, idx - 1) > 0" class="equip-cd-overlay" :class="{ 'start-anim-overlay': isEquipAnimating(role.key, idx - 1) }"></view>
										<text v-if="getEquipRemain(role.key, idx - 1) > 0" class="equip-cd" :class="{ 'start-anim-num': isEquipAnimating(role.key, idx - 1) }">{{ getEquipRemain(role.key, idx - 1) }}</text>
									</view>
								</template>
								<template v-else-if="(idx - 1) === getFirstEmptySlot(role.key)">
									<!-- 如果是第一个空位，显示加号按钮 -->
									<view class="equip-item equip-add-btn" @tap="openEquipModalForAdd(role.key)">
										<text class="equip-add-icon">+</text>
									</view>
								</template>
							</template>
						</view>
					</scroll-view>
				</view>
			</view>
		</view>
		<!-- 底部按钮 -->
		<view class="bottom-button" @tap="onLoginRechargeTap">
			<text class="bottom-button-text">登录充值可享语音操控</text>
		</view>
		<!-- 技能选择弹窗 -->
		<view v-if="showSpellModal" class="modal-mask" @tap="closeSpellModal">
			<view class="modal-content" @tap.stop>
				<view class="modal-title">选择召唤师技能</view>
				<view class="spell-grid">
					<view class="spell-item" v-for="spellKey in allSpellKeys" :key="spellKey" @tap="selectSpell(spellKey)">
						<image class="spell-item-img" :src="spellIcons[spellKey]" mode="aspectFill" />
					</view>
				</view>
			</view>
		</view>
		<!-- CD修改弹窗 -->
		<view v-if="showCdChangerModal" class="modal-mask" @tap="closeCdChangerModal">
			<view class="modal-content cd-changer-modal" @tap.stop>
				<view class="modal-title">选择CD修改</view>
				<view class="cd-changer-grid">
					<view class="cd-changer-item" :class="{ 'selected': getCdChangerState(currentCdChangerRole, 'cosmic') }" @tap="toggleCdChanger('cosmic')">
						<image class="cd-changer-item-img" src="/static/cdChanger/CosmicInsight.png" mode="aspectFit" />
						<view v-if="getCdChangerState(currentCdChangerRole, 'cosmic')" class="cd-changer-check">✓</view>
					</view>
					<view class="cd-changer-item" :class="{ 'selected': getCdChangerState(currentCdChangerRole, 'shoe') }" @tap="toggleCdChanger('shoe')">
						<image class="cd-changer-item-img" src="/static/cdChanger/shoe.png" mode="aspectFit" />
						<view v-if="getCdChangerState(currentCdChangerRole, 'shoe')" class="cd-changer-check">✓</view>
					</view>
				</view>
			</view>
		</view>
		<!-- 装备选择弹窗 -->
		<view v-if="showEquipModal" class="modal-mask" @tap="closeEquipModal">
			<view class="modal-content equip-modal-content" @tap.stop>
				<view class="modal-title">选择装备</view>
				<!-- 已装备区域 -->
				<view class="equip-section equip-section-equipped">
					<view class="equip-section-title">已装备 ({{ getEquippedCount() }}/5)</view>
					<view class="equip-modal-grid">
						<view class="equip-modal-item equip-item-equipped" 
							v-for="(equipKey, idx) in getEquippedItems()" 
							:key="'equipped-' + equipKey + '-' + idx" 
							@tap="removeEquip(equipKey, idx)"
							:class="{ 'equip-item-moving': movingEquip === equipKey && movingDirection === 'remove' }">
							<image class="equip-modal-img" :src="equipIcons[equipKey]" mode="aspectFill" />
							<view class="equip-remove-badge">×</view>
						</view>
						<view v-for="n in (5 - getEquippedCount())" :key="'empty-' + n" class="equip-modal-item equip-item-empty"></view>
					</view>
				</view>
				<!-- 未选择装备区域 -->
				<view class="equip-section equip-section-unselected">
					<view class="equip-section-title">未选择</view>
					<view class="equip-modal-grid">
						<view class="equip-modal-item equip-item-unselected" 
							v-for="equipKey in getUnselectedItems()" 
							:key="'unselected-' + equipKey"
							@tap="addEquip(equipKey)"
							:class="{ 'equip-item-moving': movingEquip === equipKey && movingDirection === 'add' }">
							<image class="equip-modal-img" :src="equipIcons[equipKey]" mode="aspectFill" />
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
		data() {
		return {
			/* 当前主题：'purple' 或 'blue' */
			currentTheme: 'purple',
			roles: [
				{ key: 'top', short: '上' },
				{ key: 'jg', short: '打' },
				{ key: 'mid', short: '中' },
				{ key: 'adc', short: '下' },
				{ key: 'sup', short: '辅' }
			],
			/* 角色图标 PNG 路径（请将对应图片放入 /src/static/roles/ 下） */
			roleIcons: {
				top: '/static/roles/top.png',
				jg: '/static/roles/jg.png',
				mid: '/static/roles/mid.png',
				adc: '/static/roles/adc.png',
				sup: '/static/roles/sup.png'
			},
			/* 召唤师技能分配：index 0 为上格，1 为下格 */
			spells: {
				top: ['flash', 'teleport'],
				jg: ['flash', 'smite'],
				mid: ['flash', 'exhaust'],
				adc: ['flash', 'barrier'],
				sup: ['flash', 'ignite']
			},
			/* 技能图标 PNG 路径（请将对应图片放入 /src/static/spells/ 下） */
			spellIcons: {
				flash: '/static/spells/flash.png',
				smite: '/static/spells/smite.png',
				ignite: '/static/spells/ignite.png',
				teleport: '/static/spells/teleport.png',
				barrier: '/static/spells/barrier.png',
				exhaust: '/static/spells/exhaust.png',
				ghost: '/static/spells/ghost.png',
				heal: '/static/spells/heal.png',
				cleanse: '/static/spells/cleanse.png',
				clarity: '/static/spells/clarity.png'
			},
			/* 技能冷却映射（单位：秒） */
			spellCdSeconds: {
				flash: 265,
				smite: 40,
				ignite: 180,
				teleport: 300,
				barrier: 125,
				exhaust: 210,
				ghost: 180,
				heal: 180,
				cleanse: 210,
				clarity: 180
			},
			/* 每个位置两个格子的剩余秒数与计时器 */
			remainMap: {},
			timerMap: {},
			/* 动画状态：点击开始计时的0.5s内为true */
			animMap: {},
			/* 弹窗状态 */
			showSpellModal: false,
			currentReplaceRole: null,
			currentReplaceIdx: null,
			/* CD修改弹窗状态 */
			showCdChangerModal: false,
			currentCdChangerRole: null,
			/* CD修改状态：每个位置的勾选状态 { roleKey: { cosmic: bool, shoe: bool } } */
			cdChangerState: {},
			/* 所有可用技能列表 */
			allSpellKeys: ['flash', 'smite', 'ignite', 'teleport', 'barrier', 'exhaust', 'ghost', 'heal', 'cleanse', 'clarity'],
			/* 装备相关 */
			allEquipKeys: ['zhonya', 'guardian_angel', 'redemption', 'locket', 'shurelya', 'qss', 'gargoyle', 'crucible'],
			equipIcons: {
				zhonya: '/static/items/zhonya.png',
				guardian_angel: '/static/items/guardian_angel.png',
				redemption: '/static/items/redemption.png',
				locket: '/static/items/locket.png',
				shurelya: '/static/items/shurelya.png',
				qss: '/static/items/qss.png',
				gargoyle: '/static/items/gargoyle.png',
				crucible: '/static/items/crucible.png'
			},
			equipCdSeconds: {
				redemption: 90,
				shurelya: 75,
				guardian_angel: 210,
				zhonya: 120,
				locket: 60,
				qss: 90,
				gargoyle: 90,
				crucible: 120
			},
			/* 每个位置的装备列表（5个装备，可以为null） */
			equips: {},
			/* 装备倒计时 */
			equipRemainMap: {},
			equipTimerMap: {},
			/* 装备动画状态 */
			equipAnimMap: {},
			/* 装备选择弹窗状态 */
			showEquipModal: false,
			currentEquipRole: null,
			currentEquipIdx: null,
			/* 装备移动动画状态 */
			movingEquip: null,
			movingDirection: null, // 'add' 或 'remove'
			/* 已移除的装备列表（按移除顺序，用于排序） */
			removedEquips: [],
			/* 待添加的装备队列（用于处理快速连续点击） */
			pendingAddQueue: []
		}
	},
	created() {
		this.initCountdownState()
		// 从本地存储读取主题
		try {
			const savedTheme = uni.getStorageSync('appTheme')
			if (savedTheme === 'purple' || savedTheme === 'blue' || savedTheme === 'green') {
				this.currentTheme = savedTheme
			}
		} catch (e) {
			console.error('读取主题失败', e)
		}
	},
	methods: {
		toggleTheme() {
			// 循环切换主题：purple -> blue -> green -> purple
			const themes = ['purple', 'blue', 'green']
			const currentIndex = themes.indexOf(this.currentTheme)
			const nextIndex = (currentIndex + 1) % themes.length
			this.currentTheme = themes[nextIndex]
			// 保存到本地存储
			try {
				uni.setStorageSync('appTheme', this.currentTheme)
			} catch (e) {
				console.error('保存主题失败', e)
			}
		},
		initCountdownState() {
			const remain = {}
			const timers = {}
			const anims = {}
			const equips = {}
			const equipRemain = {}
			const equipTimers = {}
			const equipAnims = {}
			this.roles.forEach(r => {
				remain[r.key] = [0, 0]
				timers[r.key] = [null, null]
				anims[r.key] = [false, false]
				// 初始化装备：每个位置初始为空，显示加号按钮
				equips[r.key] = []
				// 初始化装备倒计时
				equipRemain[r.key] = [0, 0, 0, 0, 0]
				equipTimers[r.key] = [null, null, null, null, null]
				// 初始化装备动画状态
				equipAnims[r.key] = [false, false, false, false, false]
			})
			this.remainMap = remain
			this.timerMap = timers
			this.animMap = anims
			this.equips = equips
			this.equipRemainMap = equipRemain
			this.equipTimerMap = equipTimers
			this.equipAnimMap = equipAnims
		},
		getRemain(roleKey, idx) {
			return this.remainMap[roleKey] ? this.remainMap[roleKey][idx] : 0
		},
		isAnimating(roleKey, idx) {
			return this.animMap[roleKey] ? this.animMap[roleKey][idx] : false
		},
		onSkillTap(roleKey, idx) {
			const spellKey = this.spells[roleKey][idx]
			if (!spellKey) return
			const cd = this.spellCdSeconds[spellKey]
			if (!cd) return
			// 若已有计时，重置为满CD重新开始
			this.clearTimer(roleKey, idx)
			this.$set(this.remainMap[roleKey], idx, cd)
			// 播放启动动画 0.5s
			this.$set(this.animMap[roleKey], idx, false)
			this.$nextTick(() => {
				this.$set(this.animMap[roleKey], idx, true)
				setTimeout(() => {
					this.$set(this.animMap[roleKey], idx, false)
				}, 500)
			})
			const timer = setInterval(() => {
				const cur = this.remainMap[roleKey][idx]
				if (cur <= 1) {
					this.clearTimer(roleKey, idx)
					this.$set(this.remainMap[roleKey], idx, 0)
					return
				}
				this.$set(this.remainMap[roleKey], idx, cur - 1)
			}, 1000)
			this.$set(this.timerMap[roleKey], idx, timer)
		},
		onSkillDoubleClick(roleKey, idx) {
			this.clearTimer(roleKey, idx)
			if (this.remainMap[roleKey]) {
				this.$set(this.remainMap[roleKey], idx, 0)
			}
		},
		onSkillLongPress(roleKey, idx) {
			// 移动端长按打开技能选择弹窗
			this.openSpellModal(roleKey, idx)
		},
		onSkillRightClick(roleKey, idx) {
			// H5右键打开技能选择弹窗
			this.openSpellModal(roleKey, idx)
		},
		/* CD修改相关方法 */
		onRoleIconLongPress(roleKey) {
			// 长按位置图标打开CD修改弹窗
			this.openCdChangerModal(roleKey)
		},
		openCdChangerModal(roleKey) {
			this.currentCdChangerRole = roleKey
			this.showCdChangerModal = true
		},
		closeCdChangerModal() {
			this.showCdChangerModal = false
			this.currentCdChangerRole = null
		},
		getCdChangerState(roleKey, type) {
			if (!roleKey || !type) return false
			if (!this.cdChangerState[roleKey]) return false
			return this.cdChangerState[roleKey][type] || false
		},
		toggleCdChanger(type) {
			if (this.currentCdChangerRole === null) return
			const roleKey = this.currentCdChangerRole
			
			// 初始化状态结构
			if (!this.cdChangerState[roleKey]) {
				this.$set(this.cdChangerState, roleKey, { cosmic: false, shoe: false })
			}
			
			// 切换状态
			const currentState = this.cdChangerState[roleKey][type]
			this.$set(this.cdChangerState[roleKey], type, !currentState)
		},
		openSpellModal(roleKey, idx) {
			this.currentReplaceRole = roleKey
			this.currentReplaceIdx = idx
			this.showSpellModal = true
		},
		closeSpellModal() {
			this.showSpellModal = false
			this.currentReplaceRole = null
			this.currentReplaceIdx = null
		},
		selectSpell(spellKey) {
			if (this.currentReplaceRole !== null && this.currentReplaceIdx !== null) {
				// 替换技能
				this.$set(this.spells[this.currentReplaceRole], this.currentReplaceIdx, spellKey)
				// 清除该位置的倒计时
				this.clearTimer(this.currentReplaceRole, this.currentReplaceIdx)
				if (this.remainMap[this.currentReplaceRole]) {
					this.$set(this.remainMap[this.currentReplaceRole], this.currentReplaceIdx, 0)
				}
				// 关闭弹窗
				this.closeSpellModal()
			}
		},
		clearTimer(roleKey, idx) {
			const t = this.timerMap[roleKey] ? this.timerMap[roleKey][idx] : null
			if (t) {
				clearInterval(t)
				this.$set(this.timerMap[roleKey], idx, null)
			}
		},
		/* 装备相关方法 */
		getEquipRemain(roleKey, idx) {
			return this.equipRemainMap[roleKey] ? this.equipRemainMap[roleKey][idx] : 0
		},
		isEquipAnimating(roleKey, idx) {
			return this.equipAnimMap[roleKey] ? this.equipAnimMap[roleKey][idx] : false
		},
		onEquipTap(roleKey, idx) {
			const equipKey = this.getEquipAtSlot(roleKey, idx)
			const cd = this.equipCdSeconds[equipKey] || 60
			// 清除旧计时器并设置剩余
			this.clearEquipTimer(roleKey, idx)
			this.$set(this.equipRemainMap[roleKey], idx, cd)
			// 播放启动动画 0.5s
			this.$set(this.equipAnimMap[roleKey], idx, false)
			this.$nextTick(() => {
				this.$set(this.equipAnimMap[roleKey], idx, true)
				setTimeout(() => {
					this.$set(this.equipAnimMap[roleKey], idx, false)
				}, 500)
			})
			const timer = setInterval(() => {
				const cur = this.equipRemainMap[roleKey][idx]
				if (cur <= 1) {
					this.clearEquipTimer(roleKey, idx)
					this.$set(this.equipRemainMap[roleKey], idx, 0)
					return
				}
				this.$set(this.equipRemainMap[roleKey], idx, cur - 1)
			}, 1000)
			this.$set(this.equipTimerMap[roleKey], idx, timer)
		},
		onEquipDblClick(roleKey, idx) {
			this.clearEquipTimer(roleKey, idx)
			if (this.equipRemainMap[roleKey]) {
				this.$set(this.equipRemainMap[roleKey], idx, 0)
			}
		},
		onEquipLongPress(roleKey, idx) {
			// 移动端长按打开装备选择弹窗
			this.openEquipModal(roleKey, idx)
		},
		onEquipRightClick(roleKey, idx) {
			// H5右键打开装备选择弹窗
			this.openEquipModal(roleKey, idx)
		},
		openEquipModal(roleKey, idx) {
			this.currentEquipRole = roleKey
			this.currentEquipIdx = idx
			// 确保装备列表已初始化（如果为空，初始化为空数组）
			if (!this.equips[roleKey]) {
				this.$set(this.equips, roleKey, [])
			}
			this.showEquipModal = true
		},
		openEquipModalForAdd(roleKey) {
			// 点击加号打开装备选择弹窗
			this.currentEquipRole = roleKey
			this.currentEquipIdx = null // 不需要指定索引，用于添加新装备
			// 确保装备列表已初始化（如果为空，初始化为空数组）
			if (!this.equips[roleKey]) {
				this.$set(this.equips, roleKey, [])
			}
			this.showEquipModal = true
		},
		getEquippedCountForRole(roleKey) {
			const equipsList = this.equips[roleKey] || []
			return equipsList.filter(equip => equip !== null && equip !== undefined).length
		},
		getEquipAtSlot(roleKey, slotIndex) {
			const equipsList = this.equips[roleKey] || []
			return equipsList[slotIndex] || null
		},
		getFirstEmptySlot(roleKey) {
			const equipsList = this.equips[roleKey] || []
			// 确保数组长度为5
			const fullList = []
			for (let i = 0; i < 5; i++) {
				fullList[i] = equipsList[i] || null
			}
			// 找到第一个空位（null 或 undefined）
			for (let i = 0; i < 5; i++) {
				if (!fullList[i]) {
					return i
				}
			}
			// 如果已满，返回 -1（不应该显示加号）
			return -1
		},
		closeEquipModal() {
			// 应用装备列表到实际位置
			if (this.currentEquipRole !== null) {
				this.applyEquipsToRole()
			}
			this.showEquipModal = false
			this.currentEquipRole = null
			this.currentEquipIdx = null
			this.movingEquip = null
			this.movingDirection = null
			this.removedEquips = []
		},
		getEquippedItems() {
			if (this.currentEquipRole === null) return []
			const equipsList = this.equips[this.currentEquipRole] || []
			// 过滤掉 null 值
			return equipsList.filter(equip => equip !== null && equip !== undefined)
		},
		getUnselectedItems() {
			if (this.currentEquipRole === null) return []
			const equipped = this.getEquippedItems()
			
			// 获取所有未选择的装备（按 allEquipKeys 的原始顺序）
			const allUnselected = this.allEquipKeys.filter(equip => !equipped.includes(equip))
			
			// 将已移除的装备从列表中分离出来
			const removedInList = this.removedEquips.filter(equip => allUnselected.includes(equip))
			const otherEquips = allUnselected.filter(equip => !this.removedEquips.includes(equip))
			
			// 返回：先放其他装备（保持原顺序），最后放已移除的装备（按移除顺序）
			return [...otherEquips, ...removedInList]
		},
		getEquippedCount() {
			return this.getEquippedItems().length
		},
		addEquip(equipKey) {
			if (this.currentEquipRole === null) return
			const equipped = this.getEquippedItems()
			
			// 如果已满5个，不允许添加
			if (equipped.length >= 5) {
				uni.showToast({
					title: '最多只能选择5个装备',
					icon: 'none',
					duration: 1500
				})
				return
			}
			
			// 如果已经在队列中，不重复添加
			if (this.pendingAddQueue.includes(equipKey)) {
				return
			}
			
			// 如果已经在已装备列表中，不重复添加
			if (equipped.includes(equipKey)) {
				return
			}
			
			// 添加到待处理队列
			this.pendingAddQueue.push(equipKey)
			
			// 如果当前没有正在处理的装备，立即开始处理队列
			if (!this.movingEquip && this.pendingAddQueue.length > 0) {
				this.processAddQueue()
			}
		},
		processAddQueue() {
			if (this.pendingAddQueue.length === 0) {
				this.movingEquip = null
				this.movingDirection = null
				return
			}
			
			const equipped = this.getEquippedItems()
			// 如果已满5个，清空队列并提示
			if (equipped.length >= 5) {
				this.pendingAddQueue = []
				uni.showToast({
					title: '最多只能选择5个装备',
					icon: 'none',
					duration: 1500
				})
				return
			}
			
			// 取出队列中的第一个装备
			const equipKey = this.pendingAddQueue.shift()
			
			// 触发动画
			this.movingEquip = equipKey
			this.movingDirection = 'add'
			
			// 动画结束后添加到列表
			setTimeout(() => {
				const currentEquipped = this.getEquippedItems()
				const newEquipped = [...currentEquipped, equipKey]
				// 先更新弹窗中的装备列表（用于显示）
				this.$set(this.equips, this.currentEquipRole, newEquipped)
				// 立即同步到装备栏显示（填充到5个元素）
				this.syncEquipsToRole(this.currentEquipRole)
				
				// 装备添加到列表后，再从已移除列表中移除（这样排序不会立即变化）
				const index = this.removedEquips.indexOf(equipKey)
				if (index !== -1) {
					this.removedEquips.splice(index, 1)
				}
				
				// 延迟清除动画状态，让Vue完成DOM更新
				this.$nextTick(() => {
					setTimeout(() => {
						this.movingEquip = null
						this.movingDirection = null
						// 继续处理队列中的下一个装备
						this.processAddQueue()
					}, 50)
				})
			}, 300)
		},
		removeEquip(equipKey, idx) {
			if (this.currentEquipRole === null) return
			
			// 记录移除的装备（如果还没有记录过）
			if (!this.removedEquips.includes(equipKey)) {
				this.removedEquips.push(equipKey)
			}
			
			// 触发动画
			this.movingEquip = equipKey
			this.movingDirection = 'remove'
			
			// 动画结束后从列表移除
			setTimeout(() => {
				const equipped = this.getEquippedItems()
				const newEquipped = equipped.filter((equip, i) => i !== idx)
				// 先更新弹窗中的装备列表（用于显示）
				this.$set(this.equips, this.currentEquipRole, newEquipped)
				// 立即同步到装备栏显示（填充到5个元素）
				this.syncEquipsToRole(this.currentEquipRole)
				// 延迟清除动画状态，让Vue完成DOM更新
				this.$nextTick(() => {
					setTimeout(() => {
						this.movingEquip = null
						this.movingDirection = null
					}, 50)
				})
			}, 300)
		},
		syncEquipsToRole(roleKey) {
			// 同步装备列表到装备栏显示（填充到5个元素）
			const equipsList = this.equips[roleKey] || []
			const actualEquips = equipsList.filter(equip => equip !== null && equip !== undefined)
			
			// 确保装备列表长度为5，不足的用null填充
			const finalEquips = []
			for (let i = 0; i < 5; i++) {
				finalEquips[i] = actualEquips[i] || null
			}
			
			// 更新装备列表
			this.$set(this.equips, roleKey, finalEquips)
		},
		applyEquipsToRole() {
			if (this.currentEquipRole === null) return
			const roleKey = this.currentEquipRole
			const newEquips = this.getEquippedItems()
			
			// 确保装备列表长度为5，不足的用null填充
			const finalEquips = []
			for (let i = 0; i < 5; i++) {
				finalEquips[i] = newEquips[i] || null
			}
			
			// 更新装备列表
			this.$set(this.equips, roleKey, finalEquips)
			
			// 调整倒计时数组长度
			if (!this.equipRemainMap[roleKey]) {
				this.$set(this.equipRemainMap, roleKey, [0, 0, 0, 0, 0])
			} else {
				const remainList = [...this.equipRemainMap[roleKey]]
				while (remainList.length < 5) {
					remainList.push(0)
				}
				remainList.splice(5)
				this.$set(this.equipRemainMap, roleKey, remainList)
			}
			
			// 调整计时器数组长度
			if (!this.equipTimerMap[roleKey]) {
				this.$set(this.equipTimerMap, roleKey, [null, null, null, null, null])
			} else {
				const timerList = [...this.equipTimerMap[roleKey]]
				while (timerList.length < 5) {
					timerList.push(null)
				}
				timerList.splice(5)
				this.$set(this.equipTimerMap, roleKey, timerList)
			}
			
			// 清除空位置的倒计时
			for (let i = 0; i < 5; i++) {
				if (finalEquips[i] === null) {
					this.clearEquipTimer(roleKey, i)
					this.$set(this.equipRemainMap[roleKey], i, 0)
				}
			}
		},
		clearEquipTimer(roleKey, idx) {
			const t = this.equipTimerMap[roleKey] ? this.equipTimerMap[roleKey][idx] : null
			if (t) {
				clearInterval(t)
				this.$set(this.equipTimerMap[roleKey], idx, null)
			}
		},
		onLoginRechargeTap() {
			// 显示开发中提示
			uni.showToast({
				title: '开发中，敬请期待',
				icon: 'none',
				duration: 2000
			})
		}
	}
}
</script>

<style>
/* 主题切换按钮 */
.theme-toggle {
	position: fixed;
	top: 60rpx;
	right: 24rpx;
	width: 64rpx;
	height: 64rpx;
	border-radius: 50%;
	background: linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%);
	backdrop-filter: blur(10rpx);
	border: 2rpx solid rgba(255, 255, 255, 0.3);
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.2);
	z-index: 100;
	transition: all 0.3s ease;
}

.theme-toggle:active {
	transform: scale(0.9);
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.15);
}

.theme-icon {
	font-size: 36rpx;
	line-height: 1;
}

/* 主题1：紫色 */
.page.theme-purple {
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.page.theme-purple .role-icon {
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.3);
}

.page.theme-purple .equip-box {
	border: 2rpx dashed rgba(102, 126, 234, 0.3);
}

.page.theme-purple .equip-add-btn {
	border: 2rpx dashed rgba(102, 126, 234, 0.4);
	box-shadow: 0 2rpx 6rpx rgba(102, 126, 234, 0.2);
}

.page.theme-purple .equip-add-icon {
	color: #667eea;
}

.page.theme-purple .modal-mask {
	background: linear-gradient(135deg, rgba(102, 126, 234, 0.6) 0%, rgba(118, 75, 162, 0.6) 100%);
}

.page.theme-purple .modal-title {
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	background-clip: text;
}

/* 主题2：蓝色 */
.page.theme-blue {
	background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.page.theme-blue .role-icon {
	background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
	box-shadow: 0 4rpx 12rpx rgba(79, 172, 254, 0.3);
}

.page.theme-blue .equip-box {
	border: 2rpx dashed rgba(79, 172, 254, 0.3);
}

.page.theme-blue .equip-add-btn {
	border: 2rpx dashed rgba(79, 172, 254, 0.4);
	box-shadow: 0 2rpx 6rpx rgba(79, 172, 254, 0.2);
}

.page.theme-blue .equip-add-icon {
	color: #4facfe;
}

.page.theme-blue .modal-mask {
	background: linear-gradient(135deg, rgba(79, 172, 254, 0.6) 0%, rgba(0, 242, 254, 0.6) 100%);
}

.page.theme-blue .modal-title {
	background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	background-clip: text;
}

/* 主题3：绿色 */
.page.theme-green {
	background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
}

.page.theme-green .role-icon {
	background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
	box-shadow: 0 4rpx 12rpx rgba(17, 153, 142, 0.3);
}

.page.theme-green .equip-box {
	border: 2rpx dashed rgba(17, 153, 142, 0.3);
}

.page.theme-green .equip-add-btn {
	border: 2rpx dashed rgba(17, 153, 142, 0.4);
	box-shadow: 0 2rpx 6rpx rgba(17, 153, 142, 0.2);
}

.page.theme-green .equip-add-icon {
	color: #11998e;
}

.page.theme-green .modal-mask {
	background: linear-gradient(135deg, rgba(17, 153, 142, 0.6) 0%, rgba(56, 239, 125, 0.6) 100%);
}

.page.theme-green .modal-title {
	background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	background-clip: text;
}

.page {
	min-height: 100vh;
	position: relative;
	transition: background 0.5s ease;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
}

.content {
	padding: 60rpx 24rpx 120rpx 24rpx;
	max-width: 700rpx;
	width: 100%;
	display: flex;
	flex-direction: column;
	justify-content: center;
}

.row {
	display: flex;
	flex-direction: row;
	align-items: center;
	margin-bottom: 28rpx;
	padding: 20rpx 16rpx;
	border-radius: 20rpx;
	background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%);
	backdrop-filter: blur(10rpx);
	box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.15), 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
	border: 1rpx solid rgba(255, 255, 255, 0.3);
	transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.row:active {
	transform: translateY(2rpx);
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.12), 0 1rpx 4rpx rgba(0, 0, 0, 0.08);
}

.role-icon-wrapper {
	display: flex;
	flex-direction: column;
	align-items: center;
	margin-right: 24rpx;
}

.role-icon {
	width: 80rpx;
	height: 80rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	border-radius: 16rpx;
	padding: 4rpx;
	box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.3);
}

.role-img {
	width: 100%;
	height: 100%;
	border-radius: 12rpx;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.2);
}

.cd-changer-badges {
	display: flex;
	flex-direction: row;
	justify-content: center;
	align-items: center;
	gap: 4rpx;
	margin-top: 6rpx;
	height: 24rpx;
}

.cd-changer-badge {
	width: 20rpx;
	height: 20rpx;
	opacity: 0.9;
}

.skills {
	display: flex;
	flex-direction: column;
	margin-right: 24rpx;
}

.skill-box {
	width: 72rpx;
	height: 72rpx;
	border-radius: 14rpx;
	border: none;
	background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%);
	margin-bottom: 12rpx;
	position: relative;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1), inset 0 1rpx 2rpx rgba(255, 255, 255, 0.8);
	overflow: hidden;
	transition: transform 0.2s ease;
}

.skill-box:active {
	transform: scale(0.95);
}

.skill-img {
	width: 100%;
	height: 100%;
	border-radius: 12rpx;
	box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.15);
}

.cd-overlay {
	position: absolute;
	left: 0;
	top: 0;
	right: 0;
	bottom: 0;
	background: linear-gradient(135deg, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0.4) 100%);
	border-radius: 12rpx;
	backdrop-filter: blur(4rpx);
	pointer-events: none;
}

.cd-text {
	position: absolute;
	left: 0;
	top: 0;
	right: 0;
	bottom: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	color: #ffffff;
	font-weight: 700;
	font-size: 28rpx;
	text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.5);
	pointer-events: none;
	z-index: 1;
}

/* 启动动画：图标轻微从大到正常并淡入；数字从更大收缩到正常；背景层只淡入不缩放 */
.start-anim {
	animation: skill-pop 0.5s ease-out both;
}
.start-anim-num {
	animation: num-shrink 0.5s ease-out both;
}
.start-anim-overlay {
	animation: overlay-fade-in 0.5s ease-out both;
}

@keyframes skill-pop {
	0% { transform: scale(1.15); opacity: 0.5; }
	100% { transform: scale(1); opacity: 1; }
}
@keyframes num-shrink {
	0% { transform: scale(1.8); }
	100% { transform: scale(1); }
}
@keyframes overlay-fade-in {
	0% { opacity: 0; }
	100% { opacity: 1; }
}

.equip-box {
	flex: 1;
	height: 100rpx;
	border-radius: 16rpx;
	border: 2rpx dashed rgba(102, 126, 234, 0.3);
	background: linear-gradient(135deg, rgba(245, 247, 250, 0.9) 0%, rgba(232, 236, 241, 0.9) 100%);
	display: flex;
	align-items: center;
	justify-content: flex-start;
	padding: 8rpx 8rpx;
	overflow: hidden;
	box-shadow: inset 0 2rpx 8rpx rgba(0, 0, 0, 0.05), 0 1rpx 2rpx rgba(255, 255, 255, 0.5);
	backdrop-filter: blur(4rpx);
}

.equip-scroll {
	width: 100%;
	height: 100%;
}

.equip-list {
	display: flex;
	flex-direction: row;
	align-items: center;
	height: 100%;
}

.equip-item {
	position: relative;
	width: 72rpx;
	height: 72rpx;
	border-radius: 14rpx;
	background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
	margin-right: 12rpx;
	overflow: hidden;
	flex-shrink: 0;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15), 0 1rpx 3rpx rgba(0, 0, 0, 0.1);
	border: 1rpx solid rgba(255, 255, 255, 0.5);
	transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.equip-item:active {
	transform: scale(0.95);
	box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.12), 0 1rpx 2rpx rgba(0, 0, 0, 0.08);
}

.equip-add-btn {
	border: 2rpx dashed rgba(102, 126, 234, 0.4);
	background: linear-gradient(135deg, rgba(245, 247, 250, 0.8) 0%, rgba(232, 236, 241, 0.8) 100%);
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.2s ease;
	min-width: 72rpx;
	box-shadow: 0 2rpx 6rpx rgba(102, 126, 234, 0.2);
}

.equip-add-btn:active {
	transform: scale(0.95);
	background: linear-gradient(135deg, rgba(232, 236, 241, 0.9) 0%, rgba(220, 224, 230, 0.9) 100%);
	border-color: rgba(102, 126, 234, 0.6);
	box-shadow: 0 1rpx 3rpx rgba(102, 126, 234, 0.3);
}

.equip-add-icon {
	font-size: 56rpx;
	color: #667eea;
	font-weight: 300;
	line-height: 1;
	text-align: center;
	display: block;
	text-shadow: 0 1rpx 2rpx rgba(102, 126, 234, 0.2);
}

.equip-img {
	width: 100%;
	height: 100%;
	object-fit: cover;
	box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.15);
}

.equip-cd-overlay {
	position: absolute;
	left: 0;
	top: 0;
	right: 0;
	bottom: 0;
	background: linear-gradient(135deg, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0.4) 100%);
	border-radius: 14rpx;
	backdrop-filter: blur(4rpx);
	pointer-events: none;
}

.equip-cd {
	position: absolute;
	left: 0;
	top: 0;
	right: 0;
	bottom: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	color: #ffffff;
	font-weight: 700;
	font-size: 26rpx;
	text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.5);
	pointer-events: none;
	z-index: 1;
}

/* 技能选择弹窗 */
.modal-mask {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: linear-gradient(135deg, rgba(102, 126, 234, 0.6) 0%, rgba(118, 75, 162, 0.6) 100%);
	backdrop-filter: blur(8rpx);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1000;
	animation: mask-fade-in 0.15s ease-out;
}

.modal-content {
	background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.95) 100%);
	backdrop-filter: blur(20rpx);
	border-radius: 28rpx;
	padding: 40rpx 32rpx;
	width: 80%;
	max-width: 600rpx;
	box-shadow: 0 16rpx 64rpx rgba(0, 0, 0, 0.3), 0 4rpx 16rpx rgba(0, 0, 0, 0.2);
	border: 1rpx solid rgba(255, 255, 255, 0.5);
	animation: modal-pop-in 0.15s ease-out;
}

@keyframes mask-fade-in {
	0% {
		opacity: 0;
	}
	100% {
		opacity: 1;
	}
}

@keyframes modal-pop-in {
	0% {
		opacity: 0;
		transform: scale(0.85) translateY(-30rpx);
	}
	100% {
		opacity: 1;
		transform: scale(1) translateY(0);
	}
}

.modal-title {
	font-size: 36rpx;
	font-weight: 700;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	background-clip: text;
	text-align: center;
	margin-bottom: 32rpx;
	text-shadow: 0 2rpx 4rpx rgba(102, 126, 234, 0.2);
}

.spell-grid {
	display: flex;
	flex-wrap: wrap;
	justify-content: space-between;
	gap: 16rpx;
	width: 464rpx;
	margin: 0 auto;
}

/* CD修改弹窗 */
.cd-changer-modal {
	max-width: 400rpx;
}

.cd-changer-grid {
	display: flex;
	flex-direction: row;
	justify-content: center;
	gap: 32rpx;
	padding: 32rpx;
}

.cd-changer-item {
	position: relative;
	width: 120rpx;
	height: 120rpx;
	border-radius: 20rpx;
	overflow: hidden;
	background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%);
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.2s ease;
	border: 3rpx solid transparent;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
}

.cd-changer-item.selected {
	border-color: #667eea;
	box-shadow: 0 4rpx 16rpx rgba(102, 126, 234, 0.4);
	background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
}

.cd-changer-item:active {
	transform: scale(0.95);
}

.cd-changer-item-img {
	width: 100rpx;
	height: 100rpx;
	border-radius: 16rpx;
	object-fit: contain;
}

.cd-changer-check {
	position: absolute;
	top: 8rpx;
	right: 8rpx;
	width: 32rpx;
	height: 32rpx;
	border-radius: 50%;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	display: flex;
	align-items: center;
	justify-content: center;
	color: #ffffff;
	font-size: 20rpx;
	font-weight: bold;
	box-shadow: 0 2rpx 8rpx rgba(102, 126, 234, 0.4);
}

.spell-item {
	width: 80rpx;
	height: 80rpx;
	border-radius: 18rpx;
	overflow: hidden;
	background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%);
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.2s ease;
	flex-shrink: 0;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15), 0 1rpx 3rpx rgba(0, 0, 0, 0.1);
	border: 1rpx solid rgba(255, 255, 255, 0.5);
}

.spell-item:active {
	transform: scale(0.9);
	box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.2), 0 1rpx 2rpx rgba(0, 0, 0, 0.15);
}

.spell-item-img {
	width: 80rpx;
	height: 80rpx;
	border-radius: 16rpx;
	object-fit: cover;
	box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.15);
}

/* 装备选择弹窗 */
.equip-modal-content {
	max-height: 80vh;
	overflow-y: auto;
}

.equip-section {
	margin-bottom: 32rpx;
	padding: 24rpx;
	border: 2rpx solid #dcdfe6;
	border-radius: 16rpx;
	background-color: #fafafa;
}

.equip-section:last-child {
	margin-bottom: 0;
}

.equip-section-equipped {
	background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
	border-color: #4caf50;
}

.equip-section-unselected {
	background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
	border-color: #ff9800;
}

.equip-section-title {
	font-size: 28rpx;
	font-weight: 600;
	color: #606266;
	margin-bottom: 20rpx;
	text-align: center;
}

.equip-modal-grid {
	display: flex;
	flex-wrap: wrap;
	justify-content: flex-start;
	gap: 16rpx;
}

.equip-modal-item {
	width: 80rpx;
	height: 80rpx;
	border-radius: 16rpx;
	overflow: hidden;
	background-color: #ffffff;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
	flex-shrink: 0;
	position: relative;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
	animation: equip-appear 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.equip-modal-item:active {
	transform: scale(0.9);
}

.equip-item-equipped {
	border: 2rpx solid #4caf50;
	background-color: #ffffff;
}

.equip-item-equipped:active {
	border-color: #2e7d32;
}

.equip-item-unselected {
	border: 2rpx solid #ff9800;
	background-color: #ffffff;
}

.equip-item-unselected:active {
	border-color: #f57c00;
}

.equip-item-empty {
	border: 2rpx dashed #c0c4cc;
	background-color: #f5f7fa;
	animation: none !important;
	pointer-events: none;
}

.equip-item-moving {
	opacity: 0.3;
	transform: scale(0.7) rotate(5deg);
	z-index: 10;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes equip-appear {
	0% {
		opacity: 0;
		transform: scale(0.5);
	}
	60% {
		transform: scale(1.1);
	}
	100% {
		opacity: 1;
		transform: scale(1);
	}
}

.equip-modal-img {
	width: 100%;
	height: 100%;
	border-radius: 14rpx;
	object-fit: cover;
}

.equip-remove-badge {
	position: absolute;
	top: -8rpx;
	right: -8rpx;
	width: 32rpx;
	height: 32rpx;
	border-radius: 50%;
	background-color: #f56c6c;
	color: #ffffff;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 24rpx;
	font-weight: bold;
	line-height: 1;
	box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.2);
	z-index: 1;
}

/* 底部按钮 */
.bottom-button {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	height: 100rpx;
	background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%);
	backdrop-filter: blur(20rpx);
	border-top: 1rpx solid rgba(255, 255, 255, 0.3);
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.1);
	z-index: 50;
	transition: all 0.3s ease;
}

.bottom-button:active {
	background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.85) 100%);
}

.bottom-button-text {
	font-size: 28rpx;
	font-weight: 600;
	color: #303133;
	letter-spacing: 1rpx;
}

/* 主题适配 */
.page.theme-purple .bottom-button-text {
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	background-clip: text;
}

.page.theme-blue .bottom-button-text {
	background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	background-clip: text;
}

.page.theme-green .bottom-button-text {
	background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	background-clip: text;
}
</style>


