<template>
  <PDialog 
    :title="'Filter'"
    :width="200"
    :top="top"
    :left="left"
    v-model:show="show">
    <input type="text" @keydown.enter="() => show = false" v-model="col.filterText"/>
  </PDialog>
</template>

<script setup>
import { ref, toRef, watch } from 'vue';
import * as mdi from '@mdi/js';
import PDialog from '@/components/PDialog/PDialog.vue';

defineExpose({
  open,
});

const emit = defineEmits([
  'filter'
]);

const props = defineProps({
  col: Object,
});

const show = ref(false);
const top = ref(0);
const left = ref(0);
const col = toRef(props, 'col');

watch(col, (val) => {
  if(val.filterText) {
    val.filter = mdi.mdiMagnify;
  } else {
    val.filter = '';
  }
}, { deep: true });

watch(show, (val) => {
  if(!val) {
    emit('filter');
  }
})

function open(event) {
  top.value = event.clientY;
  left.value = event.clientX;
  show.value = true;
}
</script>

<style scoped>

</style>