<script setup lang="ts">
</script>

<template>
    <div class='-content home-page'>
        <carousel
            :width=500
            :height=200
            :images='_carousel'/>
        <div class='-section info'>
            <div class='info-section announcement'>
                <div class='-flex-row title'>
                    <div class='caption'>公告通知</div>
                    <div class='more'>>>更多</div>
                </div>
                <div class='-scroll-y list'>
                    <div class='-flex-row important item' title='针对目前我市招牌广告缺乏统一规划，设置杂乱等现象，根据《中华人民共和国城市规划法》'>
                        <div class='icon'>重要</div>
                        <div class='content'>针对目前我市招牌广告缺乏统一规划，设置杂乱等现象，根据《中华人民共和国城市规划法》</div>
                    </div>
                    <div class='-flex-row warning item' title='针对目前我市招牌广告缺乏统一规划，设置杂乱等现象，根据《中华人民共和国城市规划法》'>
                        <div class='icon'>关注</div>
                        <div class='content'>针对目前我市招牌广告缺乏统一规划，设置杂乱等现象，根据《中华人民共和国城市规划法》</div>
                    </div>
                    <div class='-flex-row item' title='针对目前我市招牌广告缺乏统一规划，设置杂乱等现象，根据《中华人民共和国城市规划法》'>
                        <div class='icon'>一般</div>
                        <div class='content'>针对目前我市招牌广告缺乏统一规划，设置杂乱等现象，根据《中华人民共和国城市规划法》</div>
                    </div>
                    <div class='-flex-row item' title='针对目前我市招牌广告缺乏统一规划，设置杂乱等现象，根据《中华人民共和国城市规划法》'>
                        <div class='icon'>一般</div>
                        <div class='content'>针对目前我市招牌广告缺乏统一规划，设置杂乱等现象，根据《中华人民共和国城市规划法》</div>
                    </div>
                    <div class='-flex-row item' title='针对目前我市招牌广告缺乏统一规划，设置杂乱等现象，根据《中华人民共和国城市规划法》'>
                        <div class='icon'>一般</div>
                        <div class='content'>针对目前我市招牌广告缺乏统一规划，设置杂乱等现象，根据《中华人民共和国城市规划法》</div>
                    </div>
                    <div class='-flex-row item' title='针对目前我市招牌广告缺乏统一规划，设置杂乱等现象，根据《中华人民共和国城市规划法》'>
                        <div class='icon'>一般</div>
                        <div class='content'>针对目前我市招牌广告缺乏统一规划，设置杂乱等现象，根据《中华人民共和国城市规划法》</div>
                    </div>
                </div>
            </div>
            <div class='info-section news'>
                <div class='-flex-row title'>
                    <div class='caption'>新闻资讯</div>
                    <div class='more'>>>更多</div>
                </div>
                <div class='-scroll-y list'>
                    <div class='item'>关于XXX公司航线相关客票特殊优惠政策</div>
                    <div class='item'>关于XXX公司航线相关客票特殊优惠政策</div>
                    <div class='item'>关于XXX公司航线相关客票特殊优惠政策</div>
                    <div class='item'>关于XXX公司航线相关客票特殊优惠政策</div>
                    <div class='item'>关于XXX公司航线相关客票特殊优惠政策</div>
                    <div class='item'>关于XXX公司航线相关客票特殊优惠政策</div>
                    <div class='item'>关于XXX公司航线相关客票特殊优惠政策</div>
                    <div class='item'>关于XXX公司航线相关客票特殊优惠政策</div>
                </div>
            </div>
            <div class='info-section todo-list'>
                <div class='-flex-row title'>
                    <div class='caption'>待办事项</div>
                    <div class='more'>>>更多</div>
                </div>
                <div class='-scroll-y list'>
                    <div class='item'>关于XXX公司航线相关客票特殊优惠政策</div>
                    <div class='item'>关于XXX公司航线相关客票特殊优惠政策</div>
                    <div class='item'>关于XXX公司航线相关客票特殊优惠政策</div>
                    <div class='item'>关于XXX公司航线相关客票特殊优惠政策</div>
                    <div class='item'>关于XXX公司航线相关客票特殊优惠政策</div>
                    <div class='item'>关于XXX公司航线相关客票特殊优惠政策</div>
                    <div class='item'>关于XXX公司航线相关客票特殊优惠政策</div>
                    <div class='item'>关于XXX公司航线相关客票特殊优惠政策</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script language='ts'>
    import Carousel from './Carousel.vue';

	export default {
		name: 'HomePage',

		components: {
            Carousel
		},

		data() {
			return {
                _carousel: [],
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

        watch: { 
        },

		methods: {            
            /*************************/
			init() {
                console.log('Initialize home page/');
                this.loadCarousel();
            },

			uninit() {
				console.log('Uninitialize home page.');
			},

            loadCarousel() {
                console.log(`Load home page carousel.`);
                let _this = this;
                
                // 取数
                this.$server.home_page.carousel().then(function(data) { 
                    console.log(`Load home page carousel data success.data="${JSON.stringify(data)}"`);
                    _this._carousel = data;

                    // 添加随机数，确保现实最新图片
                    for (let i = 0; i < _this._carousel.length; i++) {
                        let r = Math.random() * 100;
                        _this._carousel[i] += '?' + r;
                    }
                }).catch(function (error) {
                    console.log('Load home page carousel data fail.');
                });
            },
        }
	}
</script>

<style src='./HomePage.less' lang='less' scoped/>
<style scoped>
</style>
