<template>
  <div class="toolbar" :style="toolbarStyle">
    <div>
      <svg-icon type="mdi" :path="mdi.mdiPlusBoxOutline" @click="addRow(null)"/>
    </div>
  </div>
  <div class="mainDiv" 
    :style="mainDivStyle" ref="mainDiv" 
    @scroll="displayData">
    <table>
      <thead>
        <tr>
          <th class="header-front-th">
            <div>
              <svg-icon type="mdi" :path="mdi.mdiFilterCogOutline"/>
            </div>
          </th>
          <th v-for="col in headers" :key="col" 
            :style="col.headerStyle">
            <div class="header-th">
              <svg-icon type="mdi" 
                :path="col.filter ? mdi.mdiFilterPlus : mdi.mdiFilterOutline"
                :class="col.filter ? 'icon-on' : 'icon-off'" 
                @click="showFilter($event, col)"/>
              {{ col.title }}
              <svg-icon type="mdi" 
                :path="col.sort || mdi.mdiChevronUp" 
                :class="col.sort ? 'icon-on' : 'icon-off'" 
                @click="doSortFilter(col)"/>
            </div>
          </th>
        </tr>
      </thead>

      <tfoot>
        <tr>
          <td></td>
          <td v-for="col in headers" :key="col"
            :style="col.bodyStyle">
            {{ col.title }}
          </td>
        </tr>
      </tfoot>

      <tbody>
        <div :style="topBufferDiv"></div>
        <tr v-for="row in displayedList" :key="row" @click="selectRow(row)">
          <td :class="'header-front-td ' + getClass('tbody td', row)">
            <div>
              <svg-icon type="mdi" :path="mdi.mdiMinusBoxOutline"/>
            </div>
          </td>
          <td v-for="col in headers" :key="col" 
            :style="col.bodyStyle" :class="getClass('tbody td', row)">
            <slot name="body" :item="row" :column="col.key">
              {{ row[col.key] }}
            </slot>
          </td>
        </tr>
        <div :style="bottomBufferDiv"></div>
      </tbody>
    </table>
  </div>
  <PFilterDialog ref="filterDialog" :filterList="filterList"
    @filter="doSortFilter"/>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import * as mdi from '@mdi/js';
import PFilterDialog from '@/components/PGrid/PFilterDialog.vue';

defineExpose({
  setList,
  addRow,
});

const emit = defineEmits([

]);

const props = defineProps({
  name: String,
  headers: Array,
  height: Number,
  width: Number,
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
const toolbarStyle = reactive({
  width: props.width + 'px',
});
const mainDivStyle = reactive({ 
  height: props.height + 'px',  // 전체 table을 감싸는 div의 높이
  width: props.width + 'px'
});

let orglist = []; // 원본 List (sort, filter, 입력, 수정 아무것도 안된 original)
let unFilterList = []; // filter 안된 List
let sortList = []; // sort 되는 column들의 List
let pGridUniqueIndex = 0;
const filterList = ref([]); // filter 되는 column들의 List
const sortedFilteredList = ref([]); // sort & filter 된 List
const displayedList = ref([]); // tbody에 display 되는 dataList

const selectedRow = reactive({}); // 현재 선택된 row

const topBufferDiv = reactive({ height: 0 }); // tbody display 되는 data 위쪽 buffer div의 높이
const bottomBufferDiv = reactive({ height: 0 }); // tbody display 되는 data 아래쪽쪽 buffer div의 높이

const loadSizeHeight = computed(() => props.height * props.vPanelSize); // tbody에 display 되는 layer size 높이
const totalScrollableHeight = computed(() => sortedFilteredList.value.length * props.maxRowHeight);

// methods
function setList(list) { 
  // grid init 역할을 하고 있는데 혹시 필요시 method 분리 필요
  // 변수 초기화
  unFilterList = list;
  sortList = [];
  pGridUniqueIndex = 0;

  // refs 초기화
  filterList.value = [];
  selectedRow.value = {};

  // headers 초기화
  props.headers.forEach(col => {
    if(col.filter) col.filter = false;
    if(col.filterText) col.filterText = '';
    if(col.sort) col.sort = '';
  });


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
  selectedRow.value = {}; // 스크롤 할 경우 선택한 행 초기화
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

// 정렬 버튼 눌렀을 때
function sort(col) {
  // 일단 정렬 없는 원래 상태로 복구
  sortedFilteredList.value.sort((a, b) => a.pGridUniqueIndex - b.pGridUniqueIndex);

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
  filterDialog.value.open(event, col);
}

// filter 함수
function filter() {
  // 일단 필터 없는 원래 상태로 복구
  sortedFilteredList.value = unFilterList;

  // 필요 없는 filter 목록 정리
  filterList.value = filterList.value.filter(filterItem => {
    if(filterItem.filterText) {
      filterItem.filter = true;
      return true;
    } else {
      filterItem.filter = false;
      return false;
    }
  });

  // 필터 실행
  if(filterList.value.length > 0) {
    sortedFilteredList.value = sortedFilteredList.value.filter(item => {
      let rtn = true;
      filterList.value.forEach(value => {
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

// add row
function addRow(param) {
  let newRow = null;
  if(param) {
    newRow = param;
    newRow.crud = "C";
    pGridUniqueIndex = pGridUniqueIndex++;
  } else {
    newRow = { 
      crud: "C",
      pGridUniqueIndex: pGridUniqueIndex++,
    };
  }

  let index = sortedFilteredList.value.findIndex((value) => value == selectedRow.value);
  if(index > -1) sortedFilteredList.value.splice(index, 0, newRow); // 선택한 행이 있으면 선택한 행 앞에 추가
  else { // 선택한 행이 없을 땐 맨 앞에 추가하고 맨 위로 이동
    sortedFilteredList.value.unshift(newRow); // 배열에 추가
    mainDiv.value.scrollTop = 0; // 스크롤 이동
  }
  
  displayData(); // display 함수 호출
}

// select row
function selectRow(item) {
  selectedRow.value = item;
}

// 조건부 class
function getClass(location, param) {
  if(location == 'tbody td') {
    if(selectedRow.value == param) {
      return 'selected';
    }
  }
}
</script>

<style scoped>
@import './PGrid.css';
</style>