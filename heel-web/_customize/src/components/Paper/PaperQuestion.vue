<template>
	<div :class='"-section paper-question question-" + (data["seq"] + 1)'>
        <template v-if='"SINGLE_CHOICE" == data["type_code"]'>
            <div class='title'>{{ data['seq'] + 1 }}、{{ data['question'] }}</div>
            <template v-for='(item, index) in data["options"]'>
                <div class='-scale option'>
                    <paper-radio :name='question_id' :value='item["seq"]' :title='item["seq"] + "、" +item["title"]' :picture='item["Picture"]' :pictureUrl='item["PictureUrl"]' width='100%'/>
                </div>
            </template>
        </template>
        
        <template v-if='"MULTI_CHOICE" == data["type_code"]'>
            <div class='title'>{{ data['seq'] + 1 }}、{{ data['question'] }}</div>
            <template v-for='(item, index) in data["options"]'>
                <div class='-scale option'>
                    <paper-checkbox :name='question_id' :value='item["seq"]' :title='item["seq"] + "、" +item["title"]' :picture='item["Picture"]' :pictureUrl='item["PictureUrl"]' width='100%'/>
                </div>
            </template>
        </template>
        
        <template v-if='"JUDGEMENT" == data["type_code"]'>
            <div class='title'>{{ data['seq'] + 1 }}、{{ data['question'] }}</div>
            <div class='-scale option'>
                <paper-radio :name='question_id' value=1 title='是' width='100%'/>
            </div>
            <div class='-scale option'>
                <paper-radio :name='question_id' value=0 title='否' width='100%'/>
            </div>
        </template>

        <template v-if='"SHORT_ANSWER" == data["type_code"]'>
            <div class='title'>{{ data['seq'] + 1 }}、{{ data['question'] }}</div>
            <div class='multi-line-input'>
                <paper-textarea/>
            </div>
        </template>

        <template v-if='"FILL_IN_THE_BLANKS" == data["type_code"]'>
            <span class='question-part'>{{ data['seq'] + 1 }}、</span>
            <template v-for='(item, index) in question_parts'>
                <span class='question-part'>{{ item }}</span>
                <template v-if='index < question_parts.length - 1'>
                    <span class='question-part'><paper-input width='100px'/></span>
                </template>
            </template>
        </template>
    </div>
</template>

<script lang="ts">
    import {computed} from 'vue';
    import PaperRadio from './Common/PaperRadio.vue';
    import PaperCheckbox from './Common/PaperCheckbox.vue';
    import PaperTextarea from './Common/PaperTextarea.vue';
    import PaperInput from './Common/PaperInput.vue';

    export default {
        name: 'PaperQuestion',

        components: {
            PaperRadio,
            PaperCheckbox,
            PaperTextarea,
            PaperInput,
        },

        setup(props) {
            const question_id = computed(() => {
                let data:any = Object.assign([], props['data']); // 复制数据
                let result:string = '';

                result = `${data['seq']}`;

                return result;
            });

            const question_parts = computed(() => {
                let data:any = Object.assign([], props['data']); // 复制数据
                let result = data['question'].split('()');

                return result;
            });

            return {
                question_id,
                question_parts,
            };
        },

        props: {
            data: {
                type: Object,
                default: {},
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
                console.log('Initialize paper question');
            },

            uninit() {
                console.log('Uninitialize paper question');
            },
        }
    }

</script>


<style src='./PaperQuestion.less' lang='less' scoped/>
<style scoped>
</style>
