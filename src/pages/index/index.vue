<template>
  <view class="container" :class="'theme-' + currentTheme">
    <view class="theme-toggle" @tap="toggleTheme">
      <text class="theme-icon">🎨</text>
    </view>
    <view class="content-wrapper">
      <image class="logo-hero" src="/static/LOL.png" mode="widthFix" @click="goHero" />
      <text class="enter-text">进入英雄联盟计时器</text>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      currentTheme: 'purple'
    }
  },
  created() {
    this.loadTheme()
  },
  onShow() {
    // 页面显示时重新加载主题（从其他页面返回时）
    this.loadTheme()
  },
  methods: {
    loadTheme() {
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
    goHero() {
      uni.navigateTo({ url: '/pages/hero/index' })
    }
  }
}
</script>

<style>
/* 主题切换按钮 */
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

.container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  transition: background 0.5s ease;
}

/* 主题1：紫色 */
.container.theme-purple {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* 主题2：蓝色 */
.container.theme-blue {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

/* 主题3：绿色 */
.container.theme-green {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
}

.container::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  animation: pulse 8s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1) rotate(0deg);
    opacity: 0.3;
  }
  50% {
    transform: scale(1.1) rotate(180deg);
    opacity: 0.5;
  }
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1;
  padding: 40rpx;
}

.logo-hero {
  width: 520rpx;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  filter: drop-shadow(0 8rpx 24rpx rgba(0, 0, 0, 0.3));
  border-radius: 24rpx;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  padding: 20rpx;
  backdrop-filter: blur(10rpx);
  border: 2rpx solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 16rpx 48rpx rgba(0, 0, 0, 0.2), inset 0 2rpx 4rpx rgba(255, 255, 255, 0.1);
  cursor: pointer;
}

.logo-hero:hover {
  backdrop-filter: blur(20rpx);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%);
  border: 2rpx solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.3), inset 0 2rpx 8rpx rgba(255, 255, 255, 0.2);
  transform: scale(1.02);
  filter: drop-shadow(0 12rpx 32rpx rgba(0, 0, 0, 0.4));
}

.logo-hero:active {
  transform: scale(0.92);
  filter: drop-shadow(0 4rpx 12rpx rgba(0, 0, 0, 0.25));
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.15), inset 0 1rpx 2rpx rgba(255, 255, 255, 0.1);
}

.enter-text {
  margin-top: 48rpx;
  font-size: 32rpx;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
  text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.3);
  letter-spacing: 2rpx;
  animation: fade-in-up 0.6s ease-out 0.2s both;
}

@keyframes fade-in-up {
  0% {
    opacity: 0;
    transform: translateY(20rpx);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
