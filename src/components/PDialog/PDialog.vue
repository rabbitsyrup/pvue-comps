<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="modal-mask">
        <div class="modal-container" :style="containerStyle">
          <div class="modal-header">
            {{ title }}
            <svg-icon type="mdi"
              style="float: right;" 
              :path="mdiClose" 
              @click="close"/>
          </div>

          <div class="modal-body">
            <slot></slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script>
import { computed } from 'vue';
import { mdiClose } from '@mdi/js';

export default {
  emits: [
    'update:show'
  ],
  props: {
    title: {
      type: String,
      default: "Title"
    },
    width: Number,
    show: Boolean,
  },
  setup(props, { emit }) {
    const show = computed({
      get() {
        return props.show
      },
      set(value) {
        emit('update:show', value)
      }
    });

    function close() {
      show.value = false;
    }

    return {
      //import
      mdiClose,

      //props
      containerStyle: {width: props.width + 'px'},

      //computed (v-model)
      show,

      //function
      close,
    }
  },
}
</script>

<style scoped>
.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  transition: opacity 0.3s ease;
}

.modal-container {
  margin: auto;
  background-color: grey;
  border-radius: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
  transition: all 0.3s ease;
}

.modal-header {
  border-radius: 15px 15px 0px 0px;
  padding: 5px 10px 5px 10px;
  background-color: #42b983;
}

.modal-body {
  margin: 5px;
}

/* modal Transition */
.modal-enter-from {
  opacity: 0;
}

.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
}
</style>