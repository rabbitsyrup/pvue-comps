<template>
  <div class="mainDiv" 
    :style="mainDivStyle" ref="mainDiv" 
    @scroll="displayData">
    <table>
      <thead>
        <tr>
          <th v-for="col in headers" :key="col" 
            :style="col.headerStyle">
            {{ col.title }}
            <svg-icon type="mdi" style="position: fixed;"
              :path="col.sort || ''" @click="sort(col)"
            />
          </th>
        </tr>
      </thead>

      <tfoot>
        <tr>
          <td v-for="col in headers" :key="col"
            :style="col.bodyStyle">
            {{ col.title }}
          </td>
        </tr>
      </tfoot>

      <tbody>
        <tr>
          <td :colspan="headers.length">
            <div :style="topBufferDiv"></div>
          </td>
        </tr>
        <tr v-for="row in displayedList" :key="row">
          <td v-for="col in headers" :key="col" 
            :style="col.bodyStyle">
            <slot name="body" :item="row" :column="col.key">
              {{ row[col.key] }}
            </slot>
          </td>
        </tr>
        <tr>
          <td :colspan="headers.length">
            <div :style="bottomBufferDiv"></div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import * as mdi from '@mdi/js';
import PFilterDialog from '@/components/PGrid/PFilterDialog.vue';

defineExpose({
  setList,
});

const emit = defineEmits([

]);

const props = defineProps({
  name: String,
  headers: Array,
  height: Number,
  maxRowHeight: {
    type: Number,
    default: 26,
    // 가상 패널 Row 수 계산에 쓸 rowHeight (실제 rowheight의 Max 값)
    // 한 row 당 넉넉하게 30 정도 주면 될 것 같음 (길게 주면 multi-row 가능함)
    // 너무 작게 주면 순환 스크롤 오류 생기나 많이 주면 vPanelSize 늘리면 됨 (Perfomance는 고려해야 함)
  },
  vPanelSize: {
    type: Number,
    default: 1 
    // 가상 패널에 사전에 load 할 row의 숫자를 정하는 계수
    // row 숫자를 늘리기 위해서 vRowHeight 숫자를 늘리면 vPanelSize를 늘려야 함
  }
});

// refs
const mainDiv = ref(null);

// local data
const mainDivStyle = reactive({ height: props.height + 'px' }); // 전체 table을 감싸는 div의 높이 (props)

let sortList = []; // sort 되는 column들의 List
let orglist = []; // 원본 List
let pGridUniqueIndex = 0;
const sortedList = ref([]); // sort & filter 된 List
const displayedList = ref([]); // tbody에 display 되는 dataList

const topBufferDiv = reactive({ height: 0 }); // tbody display 되는 data 위쪽 buffer div의 높이
const bottomBufferDiv = reactive({ height: 0 }); // tbody display 되는 data 아래쪽쪽 buffer div의 높이

const loadSizeHeight = computed(() => props.height * props.vPanelSize); // tbody에 display 되는 layer size 높이
const totalScrollableHeight = computed(() => sortedList.value.length * props.maxRowHeight);

// methods
function setList(list) {
  // 변수 초기화
  sortList = [];
  pGridUniqueIndex = 0;

  // list에 unique index 부여
  list.forEach(item => {
    item.pGridUniqueIndex = pGridUniqueIndex++;
  });

  // orglist는 혹시나 restore 기능 넣을까봐 일단 넣어둠
  orglist = [...list];
  sortedList.value = list;

  // 최초 display
  displayData();
}

function displayData() {
  let scrollTop = 0;
  if(mainDiv.value) scrollTop = mainDiv.value.scrollTop;

  let startIndex = Math.floor(
    Math.max(0, (scrollTop - loadSizeHeight.value)) / props.maxRowHeight
  ); // max(0, (현재스크롤위치 - display되는 높이)) / 행의 높이
  let endIndex = Math.ceil(
    Math.min(totalScrollableHeight.value, (scrollTop + loadSizeHeight.value)) / props.maxRowHeight
  ); // min(전체스크롤길이, (현재스크롤위치 + display되는 높이)) / 행의 높이

  displayedList.value = sortedList.value.slice(startIndex, endIndex + 1);
  topBufferDiv.height = startIndex * props.maxRowHeight + 'px';
  bottomBufferDiv.height = Math.max(0, (sortedList.value.length - endIndex - 1) * props.maxRowHeight) + 'px';
}

function sort(col) {
  sortedList.value.sort((a, b) => a.pGridUniqueIndex - b.pGridUniqueIndex);

  let index = sortList.findIndex((value) => value.key == col.key);
  if(index > -1) sortList.splice(index, 1);

  if(!col.sort || col.sort == '') {
    sortList.push({key: col.key, type: 'asc'});
    sortedList.value.sort((a, b) => compare(a, b));

    col.sort = mdi.mdiChevronUp;
  } else if (col.sort == mdi.mdiChevronUp){
    sortList.push({key: col.key, type: 'desc'});
    sortedList.value.sort((a, b) => compare(a, b));

    col.sort = mdi.mdiChevronDown;
  } else {
    if(sortList.length > 0) {
      sortedList.value.sort((a, b) => compare(a, b));
    } else {
      sortedList.value.sort((a, b) => a.pGridUniqueIndex - b.pGridUniqueIndex);
    }
    col.sort = '';
  }

  displayData();
}

function compare(a, b) {
  let rtn = 0;
  for(let i = 0; i < sortList.length; i++) {
    if(rtn == 0) {
      if(sortList[i].type == 'asc') {
        let key = sortList[i].key;
        if(typeof a[key] == 'string') rtn = a[key].localeCompare(b[key]);
        if(typeof a[key] == 'number') rtn = a[key] - b[key];
      }
      if(sortList[i].type == 'desc') {
        let key = sortList[i].key;
        if(typeof a[key] == 'string') rtn = b[key].localeCompare(a[key]);
        if(typeof a[key] == 'number') rtn = b[key] - a[key];
      }
    }
  }
  return rtn;
}
</script>

<style scoped>
table { 
  border-collapse: collapse; 
  width: 100%; 
}

.mainDiv {
  overflow: auto;
}

.mainDiv thead tr th {
  background-color: #42b983;
  opacity: 100%;
  position: sticky;
  top: 0;
  z-index: 1;
}

.mainDiv thead tr:nth-child(2) th {
  position: sticky;
  top: 26px;
  z-index: 1;
}

.mainDiv thead tr:nth-child(3) th {
  position: sticky;
  top: 52px;
  z-index: 1;
}

.mainDiv tfoot tr {
  background-color: #42b983;
  position: sticky;
  bottom: 0;
  z-index: 1;
}
</style>