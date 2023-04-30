<template>
  <PDialog 
    :title="'Filter'"
    :width="350"
    :top="top"
    :left="left"
    v-model:show="show"
    @close="close">
      <table>
        <colgroup>
          <col width="40%" />
          <col width="2%" />
        </colgroup>
        <tr v-for="filterItem in filterList" :key="filterItem">
          <td>
            {{ filterItem.title }}
          </td>
          <td>
            <input type="text" @keydown.enter="close" v-model="filterItem.filterText"/>
          </td>
          <td>
            <div style="float: right; height: 24px;">
              <svg-icon type="mdi" :path="mdi.mdiClose" @click="removeFilter(filterItem)" />
            </div>
          </td>
        </tr>
      </table>
  </PDialog>
</template>

<script setup>
import { toRef, ref, reactive, watch } from 'vue';
import * as mdi from '@mdi/js';
import PDialog from '@/components/PDialog/PDialog.vue';

defineExpose({
  open,
});

const emit = defineEmits([
  'filter'
]);

const props = defineProps({
  filterList: Array,
});

const show = ref(false);
const top = ref(0);
const left = ref(0);
const col = reactive({});
const filterList = toRef(props, 'filterList');

function open(event, item) {
  col.value = item;
  top.value = event.clientY;
  left.value = event.clientX;
  let index = filterList.value.findIndex((value) => value == item);
  if(index > -1) filterList.value.splice(index, 1); // filterList 배열에서 현재 선택한 filter 있을 경우 삭제
  filterList.value.unshift(item); // filterList 배열에 현재 선택한 col 맨 앞에 insert  
  show.value = true;
}

function close() {
  emit('filter');
  show.value = false;
}

function removeFilter(filterItem) {
  filterItem.filterText = '';
  filterItem.filter = false;
  let index = filterList.value.findIndex((value) => value == filterItem);
  if(index > -1) filterList.value.splice(index, 1); // filterList 배열에서 현재 선택한 filter 삭제
  if(filterList.value.length == 0) {
    close();
  }
}
</script>

<style scoped>

</style>