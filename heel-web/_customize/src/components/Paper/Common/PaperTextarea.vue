<template>
    <textarea class='paper-textarea'>
    </textarea>
</template>

<script lang="ts">
    import {computed} from 'vue';

    export default {
        name: 'PaperTextarea',

        components: {
        },

        setup(props) {       
        },

        props: {
            value: {
                type: String,
                default: '',
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
                console.log('Initialize paper textarea');
            },

            uninit() {
                console.log('Uninitialize paper textarea');
            },
        }
    }

</script>


<style src='./PaperTextarea.less' lang='less' scoped/>
<style scoped>
</style>
