<template>
    <input 
        class='paper-input'
        type='text' 
        :style='style'/>
</template>

<script lang="ts">
    import {computed} from 'vue';

    export default {
        name: 'PaperInput',

        components: {
        },

        setup(props) {
            const style = computed(() => {
                let width = props['width'];
                let result = {
                    width: width,
                };

                return result;
            });

            return {
                style,
            };        
        },

        props: {
            width: {
                type: String,
                default: 'auto',
            }
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
                console.log('Initialize paper input');
            },

            uninit() {
                console.log('Uninitialize paper input');
            },
        }
    }
</script>


<style src='./PaperInput.less' lang='less' scoped/>
<style scoped>
</style>
