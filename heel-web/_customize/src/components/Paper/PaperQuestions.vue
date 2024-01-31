<template>
	<div class='-content -scroll-y paper-questions' :style='style'>
        <template v-for='(item, index) in data'>
            <template v-if='item["item_type"] == "category"'>
                <div class='category'>{{$utils.chinese.fromNumber(item['type_index']) + '、' + item['type_name']}}</div>
            </template>
            <template v-else-if='item["item_type"] == "question"'>
                <paper-question :data='item'/>
            </template>
        </template>
    </div>
</template>

<script lang="ts">
    import {computed} from 'vue';
    import PaperQuestion from './PaperQuestion.vue';

    export default {
        name: 'PaperQuestions',

        components: {
            PaperQuestion,
        },

        setup(props) {
            const data = computed(() => {
                let questions:any = Object.assign([], props['questions']); // 复制数组
                let result:any = [];

                // 按照seq排序
                let questionsSorted = questions.sort((a:any, b:any) => { // a是当前项，b是前一个项目
                    return a['seq'] - b['seq']; // 升序
                });

                // 遍历生成结果
                let currentQuestionType = '';
                let category_index = 0;
                for (let question of questionsSorted) {
                    // 记录题目信息
                    let item = {...question};
                    item['item_type'] = 'question';

                    // 分类改变，插入分类记录
                    if (currentQuestionType != item['type_name']) {
                        category_index += 1;
                        currentQuestionType = item['type_name'];
                        result.push({
                            item_type: 'category',
                            type_name: currentQuestionType,
                            type_index: category_index,
                        });
                    }

                    result.push(item);
                }

                return result;
            });

            return {
                data,
            };
        },

        props: {
            questions: {
                type: Array,
                default: [],
            },
            style: {
                type: Object,
                default: {}
            },

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
            /*************************/
            init() {
                console.log('Initialize paper questions');
            },

            uninit() {
                console.log('Uninitialize paper questions');
            },

            show_question(param) {
                console.log(`Show question.[${JSON.stringify(param)}]`);

                document.querySelector(`.question-${param.index}`).scrollIntoView(true);
            },
        }
    }

</script>


<style src='./PaperQuestions.less' lang='less' scoped/>
<style scoped>
</style>
