<script setup lang="ts">
</script>

<template>
  <div class='-content test'>
    <div class='title'>
      功能测试
    </div>
    <div class='sub-title'>env</div>
    <div class='-section'>
        <div class='-scale button mode' @click='onEnvMode'>mode</div>
        <div class='-scale button is-production' @click='onEnvIsProduction'>isProduction</div>
        <div class='-scale button version' @click='onEnvVersion'>version</div>
    </div>
    <div class='sub-title'>string</div>
    <div class='-section'>
        <div class='-scale button string-is-valid' @click='onStringIsValid'>isValid</div>
    </div>
    <div class='sub-title'>object</div>
    <div class='-section'>
        <div class='-scale button object-is-valid' @click='onObjectIsValid'>isValid</div>
    </div>
    <div class='sub-title'>time</div>
    <div class='-section'>
        <div class='-scale button test-time' @click='onTestTime'>test</div>
    </div>
  </div>
</template>

<script type='ts'>
	export default {
		name: 'Test',

		components: {
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
			onEnvMode() {
				console.log('On env.mode.');
                let msg = `env.mode() = ${this.$utils.env.mode()}`;

                alert(msg);
			},

            onEnvIsProduction() {
				console.log('On env.isProduction.');
                let msg = `env.isProduction() = ${this.$utils.env.isProduction()}`;

                alert(msg);
			},

            onEnvVersion() {
				console.log('On env.version.');
                let msg = `env.version() = ${this.$utils.env.version()}`;

                alert(msg);
			},

            onStringIsValid() {
				console.log('On string.isValid.');
                let msg = '';
                let s;
                msg += `string.isValid(null) = ${this.$utils.string.isValid(s)}\n`;
                s = 'hello';
                msg += `string.isValid('hello') = ${this.$utils.string.isValid(s)}`

                alert(msg);
            },

            onObjectIsValid() {
				console.log('On object.isValid.');
                let msg = '';
                let o;
                msg += `object.isValid(null) = ${this.$utils.object.isValid(o)}\n`;
                o = {};
                msg += `object.isValid({}) = ${this.$utils.object.isValid(o)}`;

                alert(msg);
            },

            onTestTime() {
				console.log('On test time.');
                let msg = ``;
                let now = new Date();
                // Format Date
                msg += `Format Current Date: ${this.$utils.time.formatDate(now)}\n`;
                // Format Time 
                msg += `Format Current Time: ${this.$utils.time.formatTime(now)}\n`;
                // Format Time With Seconds
                msg += `Format Current Time(s): ${this.$utils.time.formatTimeWithSec(now)}\n`;
                // Format Time Stamp
                msg += `Format Current Time Stamp: ${this.$utils.time.formatTimestamp(now)}\n`;
                // Format Time Stamp2
                msg += `Format Current Time Stamp2: ${this.$utils.time.currentTimestamp()}\n`;
                // Format String
                msg += `Format String: ${this.$utils.time.formatString('2222-1-11')}\n`;
                // Format current time
                for (let i=-12; i<=12; i+=2) {
                    msg += `Format Current Time Zone(${i}): ${this.$utils.time.currentTime(i)}\n`;
                }

                alert(msg);
            },

            /*************************/
			init() {
				console.log('Initialize test');
			},

			uninit() {
				console.log('Uninitialize test');
			}
		}
	}
</script>


<style src='./Test.less' lang='less' scoped/>
<style scoped>
</style>
