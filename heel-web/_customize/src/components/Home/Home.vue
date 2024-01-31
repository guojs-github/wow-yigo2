<script setup lang="ts">
</script>

<template>
  <div class='-content home'>
    <div class='title'>
      自定义页面清单
    </div>
    <div class='-row -floating item test'  @click='onTest'>功能测试</div>
    <div class='-row -floating item preview-paper'  @click='onPreviewPaper'>试卷预览</div>
    <div class='-row -floating item baidu-map'  @click='onBaiduMap'>百度地图</div>
    <div class='-row -floating item home-page'  @click='onHomePage'>自定义首页</div>
  </div>
</template>

<script type='ts'>
	export default {
		name: 'Home',

		components: {
		},

		data() {
			return {
			};
		},

		created() {
			this.init();
		},

		mounted () {
		},

		beforeDestroy() {
			this.uninit();
		},

		methods: {
			onTest() {
				console.log('On test.');

				this.$router.push({
					path: '/test',
					name: 'test'
				});
			},

			onPreviewPaper() {
				console.log('On preview paper.');

				this.$router.push({
					path: '/preview-paper',
					name: 'preview-paper'
				});
			},

			onBaiduMap() {
				console.log('On baidu map.');

				this.$router.push({
					path: '/baidu-map',
					name: 'baidu-map'
				});
			},

			onHomePage() {
				console.log('On home page.');

				this.$router.push({
					path: '/home-page',
					name: 'home-page'
				});
			},

			/*************************/
			init() {
				console.log('Initialize home');
			},

			uninit() {
				console.log('Uninitialize home');
			}
		}
	}
</script>


<style src='./Home.less' lang='less' scoped/>
<style scoped>
</style>
