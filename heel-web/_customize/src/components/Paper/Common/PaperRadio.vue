<template>
    <div class='paper-radio-wrap'>
        <label ref='paper-radio' class='paper-radio' :for='id'>
            <input 
                class='-inline'
                ref='input_control' 
                type='radio' 
                :id='id' 
                :name='name' 
                :value='value'/>
            <div class='-inline radio'></div> 
            <div class='-inline title' :style='title_style'>
                {{ title }}
            </div>
        </label>
        <template v-if='picture != ""'>
            <div class='picture' @click="on_click_image">
                <img :src='pictureUrl'/>
            </div>
        </template>
    </div>
</template>

<script lang="ts">
    import {computed} from 'vue';

    export default {
        name: 'PaperRadio',

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
                console.log('Initialize paper radio');
            },

            uninit() {
                console.log('Uninitialize paper radio');
            },

            on_click_image() {
                console.log('Click radio-box image');

                let radio:any  = this.$refs['paper-radio'];
                if (radio) radio.click();
            },
        }
    }

</script>


<style src='./PaperRadio.less' lang='less' scoped/>
<style scoped>
</style>
