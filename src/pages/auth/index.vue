<template>
  <view class="page" :class="'theme-' + currentTheme">
    <!-- 主题切换 -->
    <view class="theme-toggle" @tap="toggleTheme">
      <text class="theme-icon">🎨</text>
    </view>

    <!-- 背景动效 -->
    <view class="bg-glow" />

    <!-- 内容区域 -->
    <view class="content-wrapper">
      <view class="logo-title">
        <image class="logo" src="/static/LOL.png" mode="widthFix" />
        <view class="title-text">
          <text class="main-title">英雄联盟计时器</text>
          <text class="sub-title">登录充值可享语音操控</text>
        </view>
      </view>

      <!-- 登录 / 注册切换 -->
      <view class="tab-switch">
        <view
          class="tab-item"
          :class="{ active: mode === 'login' }"
          @tap="switchMode('login')"
        >
          <text>登录</text>
        </view>
        <view
          class="tab-item"
          :class="{ active: mode === 'register' }"
          @tap="switchMode('register')"
        >
          <text>注册</text>
        </view>
      </view>

      <!-- 表单卡片 -->
      <view class="form-card">
        <view class="form-item">
          <text class="form-label">手机号</text>
          <input
            class="form-input"
            type="number"
            placeholder="请输入手机号"
            v-model="form.phone"
          />
        </view>

        <view class="form-item">
          <text class="form-label">密码</text>
          <input
            class="form-input"
            :password="true"
            placeholder="请输入密码（至少 6 位）"
            v-model="form.password"
          />
        </view>

        <view v-if="mode === 'register'" class="form-item">
          <text class="form-label">确认密码</text>
          <input
            class="form-input"
            :password="true"
            placeholder="请再次输入密码"
            v-model="form.confirmPassword"
          />
        </view>

        <view class="helper-row">
          <text v-if="mode === 'login'" class="helper-text">未注册的手机号可先去注册</text>
          <text v-else class="helper-text">账号将保存到 LOLTimer 服务器，请妥善保管密码</text>
        </view>

        <button class="primary-btn" @tap="handleSubmit">
          <text class="primary-btn-text">
            {{ mode === 'login' ? '登录' : '注册并登录' }}
          </text>
        </button>
      </view>

      <view class="back-link" @tap="goBack">
        <text class="back-text">返回计时器</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      // 与后端对接的基础地址，与 api.md 中保持一致
      baseURL: 'https://catfnsmlquaw.sealosbja.site',
      currentTheme: 'purple',
      mode: 'login', // 'login' | 'register'
      form: {
        phone: '',
        password: '',
        confirmPassword: ''
      }
    }
  },
  onShow() {
    this.loadTheme()
  },
  created() {
    this.loadTheme()
  },
  methods: {
    loadTheme() {
      try {
        const savedTheme = uni.getStorageSync('appTheme')
        if (savedTheme === 'purple' || savedTheme === 'blue' || savedTheme === 'green') {
          this.currentTheme = savedTheme
        }
      } catch (e) {
        console.error('读取主题失败', e)
      }
    },
    toggleTheme() {
      const themes = ['purple', 'blue', 'green']
      const currentIndex = themes.indexOf(this.currentTheme)
      const nextIndex = (currentIndex + 1) % themes.length
      this.currentTheme = themes[nextIndex]
      try {
        uni.setStorageSync('appTheme', this.currentTheme)
      } catch (e) {
        console.error('保存主题失败', e)
      }
    },
    switchMode(target) {
      if (this.mode === target) return
      this.mode = target
      this.form.password = ''
      this.form.confirmPassword = ''
    },
    validatePhone(phone) {
      if (!phone) {
        uni.showToast({
          title: '请输入手机号',
          icon: 'none'
        })
        return false
      }
      // 简单手机号格式校验（1 开头，第二位 3-9，共 11 位）
      const reg = /^1[3-9]\d{9}$/
      if (!reg.test(phone)) {
        uni.showToast({
          title: '手机号格式不正确',
          icon: 'none'
        })
        return false
      }
      return true
    },
    validatePassword(password) {
      if (!password) {
        uni.showToast({
          title: '请输入密码',
          icon: 'none'
        })
        return false
      }
      if (password.length < 6) {
        uni.showToast({
          title: '密码至少 6 位',
          icon: 'none'
        })
        return false
      }
      return true
    },
    handleSubmit() {
      const { phone, password, confirmPassword } = this.form
      if (!this.validatePhone(phone) || !this.validatePassword(password)) {
        return
      }

      if (this.mode === 'register') {
        // 先校验两次密码
        if (password !== confirmPassword) {
          uni.showToast({
            title: '两次输入的密码不一致',
            icon: 'none'
          })
          return
        }

        // 调用注册接口：POST /api/auth/register
        uni.request({
          url: this.baseURL + '/api/auth/register',
          method: 'POST',
          header: {
            'Content-Type': 'application/json'
          },
          data: {
            phone,
            password
          },
          success: (res) => {
            const resp = res.data || {}
            if (resp.code === 0 && resp.data) {
              const { accessToken, refreshToken, user } = resp.data
              try {
                uni.setStorageSync('LOLTimerToken', accessToken)
                uni.setStorageSync('LOLTimerRefreshToken', refreshToken)
                // 只在本地保存基础用户信息，后续需要更多字段可以再拓展
                uni.setStorageSync('LOLTimerCurrentUser', {
                  id: user && user.id,
                  phone: user && user.phone
                })
              } catch (e) {
                console.error('保存登录状态失败', e)
              }

              uni.showToast({
                title: resp.message || '注册成功，已自动登录',
                icon: 'success',
                duration: 1500
              })
              setTimeout(() => {
                this.goBack()
              }, 600)
            } else {
              uni.showToast({
                title: resp.message || '注册失败',
                icon: 'none'
              })
            }
          },
          fail: (err) => {
            console.error('注册请求失败', err)
            uni.showToast({
              title: '网络异常，请稍后重试',
              icon: 'none'
            })
          }
        })
      } else {
        // 调用登录接口：POST /api/auth/login
        uni.request({
          url: this.baseURL + '/api/auth/login',
          method: 'POST',
          header: {
            'Content-Type': 'application/json'
          },
          data: {
            phone,
            password
          },
          success: (res) => {
            const resp = res.data || {}
            if (resp.code === 0 && resp.data) {
              const { accessToken, refreshToken, user } = resp.data
              try {
                uni.setStorageSync('LOLTimerToken', accessToken)
                uni.setStorageSync('LOLTimerRefreshToken', refreshToken)
                uni.setStorageSync('LOLTimerCurrentUser', {
                  id: user && user.id,
                  phone: user && user.phone
                })
              } catch (e) {
                console.error('保存登录状态失败', e)
              }

              uni.showToast({
                title: resp.message || '登录成功',
                icon: 'success',
                duration: 1500
              })
              setTimeout(() => {
                this.goBack()
              }, 600)
            } else {
              uni.showToast({
                title: resp.message || '登录失败',
                icon: 'none'
              })
            }
          },
          fail: (err) => {
            console.error('登录请求失败', err)
            uni.showToast({
              title: '网络异常，请稍后重试',
              icon: 'none'
            })
          }
        })
      }
    },
    goBack() {
      if (getCurrentPages && getCurrentPages().length > 1) {
        uni.navigateBack()
      } else {
        uni.reLaunch({
          url: '/pages/hero/index'
        })
      }
    }
  }
}
</script>

<style>
.page {
  min-height: 100vh;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40rpx 32rpx 60rpx;
  box-sizing: border-box;
  overflow: hidden;
  transition: background 0.5s ease;
}

.page.theme-purple {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.page.theme-blue {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.page.theme-green {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
}

.bg-glow {
  position: absolute;
  top: -40%;
  left: -40%;
  width: 180%;
  height: 180%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.18) 0%, transparent 70%);
  opacity: 0.9;
  animation: bg-pulse 10s ease-in-out infinite;
}

@keyframes bg-pulse {
  0%, 100% {
    transform: scale(1) rotate(0deg);
    opacity: 0.9;
  }
  50% {
    transform: scale(1.05) rotate(180deg);
    opacity: 1;
  }
}

.content-wrapper {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 680rpx;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.logo-title {
  display: flex;
  align-items: center;
  margin-bottom: 40rpx;
}

.logo {
  width: 140rpx;
  border-radius: 24rpx;
  padding: 12rpx;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0.08) 100%);
  backdrop-filter: blur(10rpx);
  border: 2rpx solid rgba(255, 255, 255, 0.25);
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.2), inset 0 1rpx 3rpx rgba(255, 255, 255, 0.2);
}

.title-text {
  margin-left: 24rpx;
  display: flex;
  flex-direction: column;
}

.main-title {
  font-size: 34rpx;
  font-weight: 700;
  color: #ffffff;
  text-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.4);
}

.sub-title {
  margin-top: 10rpx;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.9);
}

.tab-switch {
  display: flex;
  padding: 6rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.16);
  backdrop-filter: blur(14rpx);
  border: 1rpx solid rgba(255, 255, 255, 0.3);
  margin-bottom: 24rpx;
}

.tab-item {
  flex: 1;
  height: 70rpx;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.8);
  font-size: 26rpx;
  font-weight: 500;
  transition: all 0.25s ease;
}

.tab-item.active {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%);
  color: #333333;
  box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.2);
}

.form-card {
  margin-top: 8rpx;
  padding: 36rpx 28rpx 32rpx;
  border-radius: 28rpx;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.98) 0%, rgba(246, 249, 252, 0.97) 100%);
  backdrop-filter: blur(18rpx);
  border: 1rpx solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 18rpx 50rpx rgba(0, 0, 0, 0.22), 0 4rpx 14rpx rgba(0, 0, 0, 0.18);
}

.form-item {
  margin-bottom: 24rpx;
}

.form-label {
  display: block;
  font-size: 26rpx;
  color: #606266;
  margin-bottom: 12rpx;
}

.form-input {
  width: 100%;
  height: 80rpx;
  border-radius: 18rpx;
  padding: 0 24rpx;
  box-sizing: border-box;
  font-size: 26rpx;
  color: #303133;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%);
  border: 2rpx solid #dcdfe6;
  box-shadow: inset 0 1rpx 3rpx rgba(255, 255, 255, 0.8);
}

.form-input::placeholder {
  color: #c0c4cc;
}

.helper-row {
  margin: 8rpx 0 24rpx;
}

.helper-text {
  font-size: 22rpx;
  color: #909399;
}

.primary-btn {
  margin-top: 4rpx;
  height: 88rpx;
  border-radius: 999rpx;
  border: none;
  padding: 0;
  background: linear-gradient(135deg, #ffcc33 0%, #ff9933 40%, #ff6699 100%);
  box-shadow: 0 10rpx 26rpx rgba(0, 0, 0, 0.28);
}

.primary-btn::after {
  border: none;
}

.primary-btn-text {
  font-size: 30rpx;
  font-weight: 700;
  color: #3a1c00;
  letter-spacing: 2rpx;
}

.back-link {
  margin-top: 24rpx;
  align-self: center;
}

.back-text {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.9);
  text-decoration: underline;
}

.theme-toggle {
  position: fixed;
  top: 24rpx;
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
</style>

