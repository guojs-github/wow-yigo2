<template>
	<div class='-content -section paper-title'>
        {{title}}
        <div class='-row test-data'>
            <div class='-inline time'>【{{now}}】</div>
            <div class='-inline oid'>oid={{oid}} </div>
        </div>
	</div>
</template>

<script lang="ts">
    export default {
        name: 'PaperTitle',
        
        components: {
        },

        props: {
            title: {
                type: String,
                default: '试卷'
            },

            oid: {
                type: String,
                default: ''
            },
        },   
        
        data() {
            return {
                now: this.$utils.time.currentTimestamp(),
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
                console.log('Initialize paper title');
            },

            uninit() {
                console.log('Uninitialize paper title');
            },
        }
    }

</script>


<style src='./PaperTitle.less' lang='less' scoped/>
<style scoped>
</style>
