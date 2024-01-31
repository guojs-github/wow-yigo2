<template>
	<div class='-content -section paper-test-record'>
        <div class='-flex-row head'>
            <div class='-inline col'>题号</div>
            <div v-for='(item, index) in records' class='-inline selectable col' @click='on_click_question(index + 1)'>{{ item['seq'] + 1 }}</div>
            <div class='-inline col'>总分</div>
        </div>
        <div class='-flex-row data'>
            <div class='-inline col'>得分</div>
            <div v-for='(item, index) in records' class='-inline col'>{{ typeof item['score'] == 'undefined'? 0: item['score'] }}</div>
            <div class='-inline col'>{{ totalScore }}</div>
        </div>
	</div>
</template>

<script lang="ts">
    import {computed} from 'vue';

    export default {
        name: 'PaperTestRecord',

        components: {
        },

        setup(props) {
            const records = computed(() => {
                let questions:any = Object.assign([], props['questions']); // 复制数组
                let result:any = [];

                // 按照seq排序                
                result = questions.sort((a:any, b:any) => {
                    // a是当前项，b是前一个项目
                    return a['seq'] - b['seq']; // 顺序
                    // return b['seq'] - a['seq']; // 逆序
                });

                return result;
            });

            const totalScore = computed(() => {
                let questions:any = Object.assign([], props['questions']); // 复制数组
                let result = 0;

                for (let question of questions) {
                    result += typeof question['score'] == 'undefined'? 0: question['score'];
                }

                return result;
            });

            return {
                records,
                totalScore
            };
        },

        props: {
            questions: {
                type: Array,
                default: [],
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

        // watch: { // 监控样例
        //     questions: {
        //         deep: true,
        //         immediate: true, // 初始化也会触发
        //         handler: function(val:[]) {
        //         }
        //     }
        // },
        
        methods: {
            on_click_question(index) {
                console.log(`Click question ${index}`);

                this.$emit('select_question', {index: index})
            },

            /*************************/
            init() {
                console.log('Initialize paper test record');
            },

            uninit() {
                console.log('Uninitialize paper test record');
            },
        }
    }

</script>


<style src='./PaperTestRecord.less' lang='less' scoped/>
<style scoped>
</style>
