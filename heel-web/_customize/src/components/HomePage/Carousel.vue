<script setup lang="ts">
</script>

<template>
    <div ref='carousel' class='-flex-row carousel' @mouseenter='pause_carousel' @mouseleave='resume_carousel'>
        <div ref='slider1' id='slider1' class='slider'><img/></div>
        <div ref='slider2' id='slider2' class='slider'><img/></div>
        <div ref='slider3' id='slider3' class='slider'><img/></div>

        <i ref='left-arrow' class='fa fa-solid fa-chevron-left arrow left' @click='previous_image'></i>
        <i ref='right-arrow' class='fa fa-solid fa-chevron-right arrow right' @click='next_image'></i>
    </div>
</template>

<script language='ts'>
	export default {
		name: 'Carousel',

		components: {
		},

        props: {
            width: {
                type: Number,
                default: 0,
            },

            height: {
                type: Number,
                default: 0,
            },

            images: {
                type: Array,
                default: ['./image/1.jpg', './image/2.png', './image/3.jpg', './image/5.png', './image/6.jpg'],
            },
        },

		data() {
			return {
                _pause: false,
                _client_width: 0,
                _client_height: 0,
                _sliders: null,
                _positions: null,
                _slider_pos: null,
                _images_pos: 0,
			};
		},

		created() {
		},

		mounted () {
			this.init();
		},

		beforeDestroy() {
			this.uninit();
		},

        watch: { 
        },

		methods: {          
            pause_carousel() {
                console.log('Pause carousel play');
                this._pause = true;
            },

            resume_carousel() {
                console.log('Resume carousel play');
                this._pause = false;
            },

            previous_image() {
                this.switch_image('previous');
            },

            next_image() {
                this.switch_image('next');                
            },

            /*************************/
			init() {
                console.log('Initialize carousel.');
                this.init_interface();
            },

			uninit() {
				console.log('Uninitialize carousel.');
			},

            init_interface() {
                console.log('Initialize carousel interface.');
                const MIN_WIDTH = 200;
                const MIN_HEIGHT = 100;
                this._client_width = this.width > MIN_WIDTH ? this.width : MIN_WIDTH;
                this._client_height = this.height > MIN_HEIGHT ? this.height : MIN_HEIGHT;

                // main frame
                let el = this.$refs.carousel;
                if (el) {
                    el.style.height = this._client_height + 'px';
                }

                // sliders
                this.init_sliders();

                // arrows
                this.init_arrows();

                // switch slider
                this.switch_slider();
            },

            init_sliders() {
                // initilize sliders
                this._sliders = [];
                this._sliders.push(this.$refs.slider1);
                this._sliders.push(this.$refs.slider2);
                this._sliders.push(this.$refs.slider3);

                // initialize style
                for (let i = 0; i <this._sliders.length; i++) {
                    this._sliders[i].style.width = this._client_width + 'px';
                    this._sliders[i].style.height = this._client_height + 'px';
                }

                // center
                this._sliders[0].style.left = 'calc(50% - ' + (this._client_width / 2) + 'px)';

                // right
                this._sliders[1].style.left = 'calc(50% + 50px)';

                // left
                this._sliders[2].style.left = 'calc(50% - ' + this._client_width + 'px - 50px)';

                // initialize slider style
                this.init_slider_pos();
            },

            init_slider_pos() {
                // reset positions ///////////////////////
                this._positions = [];
                this._positions.push({ // center
                    left: this._sliders[0].offsetLeft,
                    z: 100,
                    opacity: 0.9,
                    perspective: 1000,
                    rotate_y: 0,
                    scale: 1,
                });
                this._positions.push({ // right
                    left: this._sliders[1].offsetLeft,
                    z: 98,
                    opacity: 0.7,
                    perspective: 1000,
                    rotate_y: -60,
                    scale: 0.8,
                });
                this._positions.push({ // left
                    left: this._sliders[2].offsetLeft,
                    z: 99,
                    opacity: 0.7,
                    perspective: 1000,
                    rotate_y: 60,
                    scale: 0.8,
                });
            },

            switch_slider() {
                // Check
                if (!this._sliders || this._sliders.length<=0) {
                    console.log('Invalid sliders');
                    return;
                }
                if (!this._positions || this._positions.length<=0) {
                    console.log('Invalid positions');
                    return;
                }
                if (this._sliders.length != this._positions.length) {
                    console.log('sliders and positions settings donnot match');
                    return;
                }

                // initialize
                if (!this._slider_pos) {
                    this._slider_pos = [];
                    // initialize sliders position
                    for (let i=0; i<this._sliders.length; i++) {
                        this._slider_pos.push({
                            current: i,
                            next: (i + 1) % this._positions.length,
                        });
                    }

                    // Redraw sliders
                    for (let i=0; i<this._slider_pos.length; i++) {
                        this.show_slider(this._sliders[i], this._positions[this._slider_pos[i].current]);
                    }
                }

                // animation
                this.move_sliders();
            },
            
            show_slider(slider, style) {
                let left = 0;
                let opacity = 1;
                let z_index = 0;
                let transform = '';

                // Check
                if (!slider) {
                    console.log('Invalid slider');
                    return;
                }
                if (!style) {
                    console.log('Invalid style');
                    return;
                }

                // Get settings
                for (let key in style) {
                    if ('left' == key) {
                        left = style[key];
                    } else if ('opacity' == key) {
                        opacity = style[key];
                    } else if ('perspective' == key) {
                        transform += ' perspective(' + style[key] + 'px)';
                    } else if ('rotate_y' == key) {
                        transform += ' rotateY(' + style[key] + 'deg)';
                    } else if ('scale' == key) {
                        transform += ' scale(' + style[key] + ')';
                    } else if ('z' == key) {
                        z_index = style[key];
                    }
                }

                // Update style
                slider.style.left = left + 'px';
                slider.style.opacity = opacity;
                slider.style.zIndex = z_index;
                slider.style.transform = transform;
            },

            move_sliders() {
                const MAX_STEPS = 200;
                let _this = this;
                let steps = 0;
                let init_steps = 100;

                // initialize images
                this.switch_image('reset');

                setInterval(() => {
                    // Pause ?
                    if ((0 == steps) && (_this._pause == true)) 
                        return;

                    // Next animation step
                    steps = (steps + 1) % (MAX_STEPS + 1);

                    // Next slider position
                    if (0 == steps) {
                        for (let i=0; i<_this._slider_pos.length; i++) {
                            _this._slider_pos[i].current = _this._slider_pos[i].next;
                            _this._slider_pos[i].next = (_this._slider_pos[i].next + 1) % _this._positions.length;
                        }

                        // Switch
                        _this.switch_image('next');

                        return;
                    }

                    // Wait a moment before next turn
                    if (init_steps >= steps) { 
                        return;
                    }

                    // move
                    for (let i=0; i< _this._sliders.length; i++) {
                        let slider = _this._sliders[i];
                        let current_style = _this._positions[_this._slider_pos[i].current];
                        let target_style = _this._positions[_this._slider_pos[i].next];
                        if (steps == MAX_STEPS) {
                            _this.show_slider(slider, target_style);
                        } else {
                            let steps_left = MAX_STEPS - steps;
                            let style = {
                                left: current_style.left + (target_style.left - current_style.left) / (MAX_STEPS - init_steps) * (steps - init_steps),
                                opacity: current_style.opacity + (target_style.opacity - current_style.opacity) / (MAX_STEPS - init_steps) * (steps - init_steps),
                                perspective: target_style.perspective,
                                rotate_y: current_style.rotate_y + (target_style.rotate_y - current_style.rotate_y) / (MAX_STEPS - init_steps) * (steps - init_steps),
                                scale: current_style.scale + (target_style.scale - current_style.scale) / (MAX_STEPS - init_steps) * (steps - init_steps),
                                z: target_style.z,
                            };

                            _this.show_slider(slider, style);
                        }
                    } 
                }, 10);
            },

            init_arrows() {
                // left arrow
                let left_arrow = this.$refs['left-arrow'];
                if (left_arrow) {
                    left_arrow.style.height = this._client_height + 'px';
                    left_arrow.style.lineHeight = this._client_height + 'px';
                }

                // right arrow
                let right_arrow = this.$refs['right-arrow'];
                if (right_arrow) {
                    right_arrow.style.height = this._client_height + 'px';
                    right_arrow.style.lineHeight = this._client_height + 'px';
                }
            },

            switch_image(op) {
                let size = this.images.length; 
                // Check
                if (0 >= size) { // no images
                    return;
                }
                if ('reset' == op) {
                    this._images_pos = 0;
                } else if ('next' == op) {
                    this._images_pos = (this._images_pos + 1) % size;
                } else if ('previous' == op) {
                    this._images_pos = 0 <= (this._images_pos - 1) ? this._images_pos - 1 : size - 1;
                } else {
                    return;
                }

                // Previous image and after image
                let previous = 0 <= (this._images_pos - 1) ? this._images_pos - 1 : size - 1;
                let next = (this._images_pos + 1) % size;

                // Load images
                for (let i=0; i< this._sliders.length; i++) {
                    let slider = this._sliders[i];
                    let pos = this._slider_pos[i].current;
                    if (0 == pos) { // center
                        slider.style.backgroundImage= this.get_image_url(this.images[this._images_pos]);
                    } else if (1 == pos) { // right, previous
                        slider.style.backgroundImage= this.get_image_url(this.images[previous]);
                    } else if (2 == pos) { // left, next
                        slider.style.backgroundImage= this.get_image_url(this.images[next]);
                    }
                } 
            },

            get_image_url(url) {
                return 'url(' + url + ')';
            },
        }
	}
</script>

<style src='./Carousel.less' lang='less' scoped/>
<style scoped>
</style>
