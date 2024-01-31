<template>
	<div class='-content -section paper-head'>
        <div class='-row warnning'>
            {{ warning }}
        </div>
        <div class='-row'>
            <item label='状态' :value='typeof value["status"] == "undefined"? "未知状态": value["status"]' width='25%' labelWidth='50px'/>
            <item label='试卷' v-model:value='value["no"]' width='25%'/>
            <item label='培训部门' :value='value["dep_name"]' width='25%'/>
            <item label='产品分类' :value='value["cat_name"]' width='25%'/>
        </div>
        <div class='-row'>
            <item label='司机' :value='value["driver_name"]' width='25%' labelWidth='50px'/>
            <item label='单位' :value='value["company_name"]' width='25%'/>
            <item label='手机' :value='value["mobile_phone"]' width='25%'/>
            <item label='身份证' :value='value["id_no"]' width='25%'/>
        </div>
	</div>
</template>

<script lang="ts">
    import {computed} from 'vue';
    import Item from './PaperHeadItem.vue';

    export default {
        name: 'PaperHead',

        components: {
            Item,
        },

        setup(props) {
            const warning = computed(() => {
                return `注意：考试时间${props['value']['duration']}分钟，\
                        总分${props['value']['totalscore']}分，\
                        ${props['value']['passingscore']}分合格`;
            });

            return {
                warning,
            };
        },

        props: {
            value: {
                type: Object,
                default: '',
            },
        },

        data() {
            return {
            };
        },

        created() {
        },

        mounted () {
            this.init();
        },
        
        beforeDestroy() {
            this.uninit();
        },
        
        methods: {
            /*************************/
            init() {
                console.log('Initialize paper head');
            },

            uninit() {
                console.log('Uninitialize paper head');
            },
        }
    }

</script>


<style src='./PaperHead.less' lang='less' scoped/>
<style scoped>
</style>
