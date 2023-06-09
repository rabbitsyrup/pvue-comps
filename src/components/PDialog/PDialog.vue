<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="modal-mask" @click="close($event, 'mask-area')">
        <div class="modal-container" :style="containerStyle" @click="close($event, 'container-area')">
          <div class="modal-header">
            {{ title }}
            <svg-icon type="mdi"
              style="float: right;" 
              :path="mdi.mdiClose" 
              @click="close($event, 'close-btn')"/>
          </div>

          <div class="modal-body">
            <slot></slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue';
import * as mdi from '@mdi/js';

defineExpose({
  close,
});

const emit = defineEmits([
  'update:show',
  'close'
]);

const props = defineProps({
  title: {
    type: String,
    default: "Title"
  },
  width: Number,
  show: Boolean,
  top: Number,
  left: Number,
  persistence: String,
});

const show = computed({
  get() {
    return props.show
  },
  set(value) {
    emit('update:show', value)
  }
});

const containerStyle = computed(() => { 
  return { 
    width: props.width + 'px',
    top: props.top + 'px',
    left: props.left + 'px'
  } 
});

function close(event, eventFrom) {
  event.stopPropagation(); // event 버블링 방지
  if(eventFrom == 'mask-area') {
    if(props.persistence == null) {
      emit('close');
    }
  } else if (eventFrom == 'close-btn') {
    emit('close');
  }
}
</script>

<style scoped>
.modal-mask {
  top: 0;
  left: 0;
  position: fixed;
  z-index: 9998;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  transition: opacity 0.3s ease;
}
.modal-container {
  z-index: 9999;
  position: absolute;
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
  margin: 10px;
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