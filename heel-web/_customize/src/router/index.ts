import {createRouter, createWebHashHistory} from 'vue-router'
import Home from '../components/Home/Home.vue'
import PreviewPaper from '../components/Paper/PreviewPaper.vue'
import Test from '../components/Test/Test.vue'
import BaiduMap from '../components/BaiduMap/BaiduMap.vue'
import HomePage from '../components/HomePage/HomePage.vue'

export default createRouter({
	history: createWebHashHistory(), // createWebHashHistory() 路由带#号；createWebHistory()路由不带#号
	routes: [{
		path: '/',
		name: 'Home',
		component: Home
	}, {
		path: '/preview-paper',
		name: 'preview-paper',
		component: PreviewPaper
	}, {
		path: '/test',
		name: 'test',
		component: Test
	}, {
		path: '/baidu-map',
		name: 'baidu-map',
		component: BaiduMap
	}, {
		path: '/home-page',
		name: 'home-page',
		component: HomePage
	}]
});