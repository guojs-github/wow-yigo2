<template>
    <paper-title ref='title' title='试卷预览' :oid='oid'/>
    <paper-head v-model:value='header'/>
    <paper-test-record :questions='questions' @select_question='on_test_record_select_question'/>
    <paper-questions ref='questions' :questions='questions' :style='questionStyle'/>
</template>

<script lang="ts">
    import {computed} from 'vue';
    import PaperTitle from './PaperTitle.vue';
    import PaperHead from './PaperHead.vue';
    import PaperQuestions from './PaperQuestions.vue';
    import PaperTestRecord from './PaperTestRecord.vue';

    export default {
        name: 'PreviewPaper',

        components: {
            PaperTitle,
            PaperHead,
            PaperQuestions,
            PaperTestRecord,
        },

        setup() {
            const questionStyle = computed(() => {
                return {
                    height: 'calc(100vh - 340px)'
                };
            });


            return {
                questionStyle,
            };
        },

        
        data() {
            return {
                oid: '',
                header: {},
                questions: [],
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
            on_test_record_select_question(param) {
                // console.log(`On test record select question.[${JSON.stringify(param)}]`);

                this.$refs.questions.show_question(param);
            },

            /*************************/
            init() {
                console.log('Initialize preview paper');

                this.param();
                this.loadPaper();
                this.loadQuestion();
            },

            uninit() {
                console.log('Uninitialize preview paper');
            },

            param() {
                this.oid = this.$utils.request.getUrlKey('oid');
            },

            loadPaper() {
                console.log(`Load paper data`);
                let _this = this;
                
                // 取数
                // data = this.$server.paper.infoSync(this.id); // 同步
                this.$server.paper.info(this.oid).then(function(data: any) { 
                    console.log(`Load paper data success.data="${JSON.stringify(data)}"`);
                    _this.header = data['header'];
                }).catch(function (error: any) {
                    console.log('Load paper data fail.');
                });
            },

            loadQuestion() {
                console.log(`Load paper question`);
                let _this = this;
                
                // 取数
                this.$server.paper.questions(this.oid).then(function(data: any) { 
                    console.log(`Load paper question success.data="${JSON.stringify(data)}"`);
                    _this.questions = data['questions'];
                }).catch(function (error: any) {
                    console.log('Load paper question fail.');
                });
            }

        }
    }

</script>


<style src='./PreviewPaper.less' lang='less' scoped/>
<style scoped>
</style>
