<template>
  <div class="mainDiv" 
    :style="mainDivStyle" ref="mainDiv" 
    @scroll="displayData">
    <table>
      <thead>
        <tr>
          <th v-for="col in headers" :key="col" 
            :style="col.headerStyle">
            <div class="header-left">
              <svg-icon type="mdi" :path="col.filter || ''" @click="showFilter($event, col)"
                @mouseover="filterIconOn(col)" @mouseout="filterIconOff(col)"/>
            </div>
            {{ col.title }}
            <div class="header-right">
              <svg-icon type="mdi" :path="col.sort || ''" @click="doSortFilter(col)"
                @mouseover="sortIconOn(col)"  @mouseout="sortIconOff(col)"/>
            </div>
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
  <PFilterDialog ref="filterDialog" :col="headers[filterIndex]" 
    @filter="doSortFilter"/>
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
const filterDialog = ref(null);

// local data
const mainDivStyle = reactive({ height: props.height + 'px' }); // 전체 table을 감싸는 div의 높이 (props)

let orglist = []; // 원본 List (sort, filter, 입력, 수정 아무것도 안된 original)
let unFilterList = []; // filter 안된 List
let sortList = []; // sort 되는 column들의 List
let filterList = []; // filter 되는 column들의 List
let pGridUniqueIndex = 0;
const filterIndex = ref(0);
const sortedFilteredList = ref([]); // sort & filter 된 List
const displayedList = ref([]); // tbody에 display 되는 dataList

const topBufferDiv = reactive({ height: 0 }); // tbody display 되는 data 위쪽 buffer div의 높이
const bottomBufferDiv = reactive({ height: 0 }); // tbody display 되는 data 아래쪽쪽 buffer div의 높이

const loadSizeHeight = computed(() => props.height * props.vPanelSize); // tbody에 display 되는 layer size 높이
const totalScrollableHeight = computed(() => sortedFilteredList.value.length * props.maxRowHeight);

// methods
function setList(list) {
  // 변수 초기화
  unFilterList = list;
  sortList = [];
  filterList = [];
  pGridUniqueIndex = 0;

  // list에 unique index 부여
  list.forEach(item => {
    item.pGridUniqueIndex = pGridUniqueIndex++;
  });

  // orglist는 혹시나 restore 기능 넣을까봐 일단 넣어둠
  orglist = [...list];
  sortedFilteredList.value = list;

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

  displayedList.value = sortedFilteredList.value.slice(startIndex, endIndex + 1);
  topBufferDiv.height = startIndex * props.maxRowHeight + 'px';
  bottomBufferDiv.height = Math.max(0, (sortedFilteredList.value.length - endIndex - 1) * props.maxRowHeight) + 'px';
}

// 정렬 원상태로 복구
function restoreSort() {
  sortedFilteredList.value.sort((a, b) => a.pGridUniqueIndex - b.pGridUniqueIndex);
}

// 정렬 버튼 눌렀을 때
function sort(col) {
  restoreSort(); // 일단 정렬 없는 원래 상태로 복구
  
  if(col) {
    let index = sortList.findIndex((value) => value.key == col.key);
    if(index > -1) sortList.splice(index, 1); // sortList 배열에서 현재 선택한 col 정보 삭제

    if(!col.sort || col.sort == '') {
      sortList.push({key: col.key, type: 'asc'}); // sortList 배열에 현재 선택한 col 정보 입력
      sortedFilteredList.value.sort((a, b) => compare(a, b)); // 정렬 실행

      col.sort = mdi.mdiChevronUp; // header icon 변경
    } else if (col.sort == mdi.mdiChevronUp){
      sortList.push({key: col.key, type: 'desc'});
      sortedFilteredList.value.sort((a, b) => compare(a, b));

      col.sort = mdi.mdiChevronDown;
    } else {
      if(sortList.length > 0) {
        sortedFilteredList.value.sort((a, b) => compare(a, b));
      }

      col.sort = '';
    }
  } else {
    if(sortList.length > 0) {
      sortedFilteredList.value.sort((a, b) => compare(a, b));
    }
  }
}

// custom 비교 함수
function compare(a, b) {
  let rtn = 0; // result 값 a가 b보다 클 경우 양수, 같을 경우 0, 작을 경우 음수라고 한다
  for(let i = 0; i < sortList.length; i++) { // 뭐 양수, 음수는 반대로 적은 걸수도 있는데 중요한건 0이 같다는 거고
    if(rtn == 0) { // 그러므로 sortList를 순차적으로 순회하면서 결과가 0 (앞선 순번 비교에서 동일한 경우) 인 경우
      // 다음 차례의 비교를 수행하고 0이 아닐 경우 해당 비교로 rtn을 return한다
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

// filter Dialog 함수
function showFilter(event, col) {
  filterIndex.value = props.headers.findIndex(item => item.key == col.key);
  filterDialog.value.open(event);
}

// filter 원상태로 복구
function restoreFilter() {
  sortedFilteredList.value = unFilterList;
}

// filter 함수
function filter() {
  restoreFilter(); // 일단 필터 없는 원래 상태로 복구

  filterList = []; // 빠른 탐색을 위해 header 배열에서 filterList 배열 미리 생성
  props.headers.forEach(col => {
    if(col.filterText)
      filterList.push({key: col.key, filterText: col.filterText});
  });

  // 필터 실행
  if(filterList.length > 0) {
    sortedFilteredList.value = sortedFilteredList.value.filter(item => {
      let rtn = true;
      filterList.forEach(value => {
        if(!String(item[value.key]).includes(value.filterText)) rtn = false;
      });
      return rtn;
    });
  } else { // 필터 실행되지 않은 경우에는
    unFilterList = [...sortedFilteredList.value]; // unFilterList에 보존
  }
}

// sort & filter 함수
function doSortFilter(col) {
  // 각각 서로 호출하게 하면 결국 순환 참조 오류가 생겨서 하나로 묶어야 함
  filter(); // 필터 함수 호출
  sort(col); // 정렬 함수 호출
  displayData(); // display 함수 호출
}

// icon hover event
function filterIconOn(col) {
  if(!col.filter) col.filter = mdi.mdiMagnify;
}
function filterIconOff(col) {
  let index = filterList.findIndex(item => item.key == col.key);
  if(index == -1) col.filter = '';
}
function sortIconOn(col) {
  if(!col.sort) col.sort = mdi.mdiChevronUp;
}
function sortIconOff(col) {
  let index = sortList.findIndex(item => item.key == col.key);
  if(index == -1) col.sort = '';
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

.header-left {
  float: left;
  height: 24px;
}

.header-right {
  float: right; 
  height: 24px;
}
</style>