<template>
    <div class='paper-checkbox-wrap'>
        <label ref='paper-check' class='paper-checkbox' :for='id'>
            <input 
                class='-inline'
                ref='input_control' 
                type='checkbox' 
                :id='id' 
                :name='name' 
                :value='value'/>
            <div class='-inline box'></div> 
            <div class='-inline title' :style='title_style'>{{ title }}</div>
        </label>
        <template v-if='picture != ""'>
            <div class='picture' @click='on_click_image'>
                <img :src='pictureUrl'/>
            </div>
        </template>
    </div>
</template>

<script lang="ts">
    import {computed} from 'vue';

    export default {
        name: 'PaperCheckbox',

        components: {
        },

        setup(props) {
            const id = computed(() => {
                let name = Object.assign([], props['name']);
                let value = Object.assign([], props['value']);
                let result:string = '';

                result = `${name}+${value}`;

                return result;
            });

            const title_style = computed(() => {
                let width = props['width'];
                let result = {
                    width: 'auto' == width? width: `calc(${width} - 50px)`,
                };

                return result;
            });

            return {
                id,
                title_style,
            };        
        },

        props: {
            name: {
                type: String,
                default: '',
            },

            value: {
                type: String,
                default: '',
            },

            title: {
                type: String,
                default: '',
            },

            picture: {
                type: String,
                default: '',
            },

            pictureUrl: {
                type: String,
                default: '',
            },

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
                console.log('Initialize paper checkbox');
            },

            uninit() {
                console.log('Uninitialize paper checkbox');
            },

            on_click_image() {
                console.log('Click check-box image');

                let check:any  = this.$refs['paper-check'];
                if (check) check.click();
            },
        }
    }

</script>


<style src='./PaperCheckbox.less' lang='less' scoped/>
<style scoped>
</style>
