<template>
	<div 
        class='-inline paper-head-item'
        :style='itemStyle'>
        <div 
            class='-inline lab'
            :style='labelStyle'>
            {{label}}
        </div>
        <template v-if='!edit'>
            <div 
                class='-inline val'
                :style='valueStyle'>
                {{value}}
            </div>
        </template>
        <template v-if='edit'>
            <input type='text'/>
        </template>
    </div>
</template>

<script lang="ts">
    import {computed} from 'vue';

    export default {
        name: 'PaperHeadItem',

        components: {
        },

        setup(props) {
            const itemStyle = computed(() => {
                return {
                    width: props['width'],
                };
            });

            const labelStyle = computed(() => {
                return {
                    width: props['labelWidth'],
                };
            });

            const valueStyle = computed(() => {
                return {
                    marginLeft: props['gapWidth'],
                    width: `calc(100% - ${props['gapWidth']} - ${props['labelWidth']})`,
                };
            });

            return {
                itemStyle,
                labelStyle,
                valueStyle,
            };
        },

        props:{
            edit: {
                type: Boolean,
                default: false,
            },

            label: {
                type: String,
                default: '',
            },

            value: {
                type: String,
                default: '',
            },

            width: {
                type: String,
                default: '100%',
            },

            labelWidth: {
                type: String,
                default: '100px',
            },

            gapWidth: {
                type: String,
                default: '10px',
            },
        },

        emits: [
            'update:value',     // 值更新事件
        ],        
        
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
                console.log('Initialize paper head item');
            },

            uninit() {
                console.log('Uninitialize paper head item');
            },
        },
    }

</script>


<style src='./PaperHeadItem.less' lang='less' scoped/>
<style scoped>
</style>
