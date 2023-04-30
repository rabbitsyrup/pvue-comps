<template>
  <div class="toolbar" :style="toolbarStyle">
    <div class="left-box">
      <svg-icon type="mdi" class="icon-off" :path="mdi.mdiHistory"
        @click="restoreData"/>
      <div class="vertical-bar"></div>
      {{ title }}
    </div>
    <div class="right-box">
      <svg-icon type="mdi" class="icon-off" :path="mdi.mdiFilterRemoveOutline" @click="restoreSortFilter"/>
      <div class="vertical-bar"></div>
      <input type="text" v-model="searchText" @keydown.enter="doSortFilter"/>
      <svg-icon type="mdi" class="icon-off" :path="mdi.mdiMagnify"
        @click="doSortFilter"/>
    </div>
  </div>
  <div class="mainDiv" 
    :style="mainDivStyle" ref="mainDiv" 
    @scroll="displayData">
    <table>
      <thead>
        <tr v-for="(headerGroup, index) in headerGroups" :key="headerGroup">
          <th v-if="index == 0" :rowspan="headerGroups.length"
            style="width: 30px;">
            <div class="icon-box">
              <svg-icon type="mdi" :path="mdi.mdiPlusBoxOutline" 
                class="icon-off" @click="addRow(null)"/>
            </div>
          </th>
          <th v-for="col in headerGroup" :key="col" 
            :rowspan="index == 0 && !col.grouping ? headerGroups.length : col.grouping ? col.grouping.rowspan : ''" 
            :colspan="col.grouping ? col.grouping.colspan : ''"
            :style="{width: col.width + 'px'}">
            <div class="header-th">
              <svg-icon type="mdi" v-if="!col.grouping"
                :path="col.filter ? mdi.mdiFilter : mdi.mdiFilterOutline"
                :class="col.filter ? 'icon-on' : 'icon-off'" 
                @click="showFilter($event, col)"/>
              {{ col.title }}
              <svg-icon type="mdi" v-if="!col.grouping" 
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
        <tr v-for="(row, index) in displayedList" :key="row" @click="selectRow(row)">
          <td :class="getClass('tbody td', row)">
            <div class="icon-box">
              <svg-icon type="mdi" :path="row.crud == 'D' ? mdi.mdiRestore : mdi.mdiMinusBoxOutline" 
                class="icon-off" @click="deleteRow(row)"/>
            </div>
          </td>
          <td v-for="col in headers" :key="col" 
            :style="{textAlign: col.align}" :class="getClass('tbody td', row)"
            @click="openEditor(index, col)">
            <slot v-if="col.customSlot" name="body" :item="row" :column="col.key"><!-- custom slot --></slot>
            
            <input v-else-if="col.editType == 'text' && (editor.index == index && editor.key == col.key)"
              type="text" v-focus style="width: 100%;"
              @blur="closeEditor" @keydown.enter="closeEditor"
              v-model="row[col.key]" />

            <PSelect v-else-if="col.editType == 'select' && (editor.index == index && editor.key == col.key)" 
              v-model="row[col.key]" :items="codeList[col.key]" code="cd" name="cd_nm" 
              @blur="closeEditor" v-focus style="width: 100%;"/>

            <span v-else><!-- default -->
              {{ row[col.key] }}
            </span>
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
import { ref, reactive, computed, watch } from 'vue';
import * as mdi from '@mdi/js';
import PFilterDialog from '../PGrid/PFilterDialog.vue';
import PSelect from '../PSelect/PSelect.vue';

defineExpose({
  setList,
  getList,
  getUnFilterList,
  addRow,
  deleteRow,
  restoreData,
});

const emit = defineEmits([
  'selectRow'
]);

const props = defineProps({
  title: String,
  headerGroups: Array,
  height: Number,
  width: String,
  watcherList: Array,
  readonly: Boolean,
  codeList: Object,
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
  width: props.width + 'px',
});
const editor = ref({
  index: -1,
  key: -1,
});

let orglist = []; // 원본 List (sort, filter, 입력, 수정 아무것도 안된 original)
let unFilterList = []; // filter 안된 List
let sortList = []; // sort 되는 column들의 List
let pGridUniqueIndex = 0;
const searchText = ref("");
const filterList = ref([]); // filter 되는 column들의 List
const sortedFilteredList = ref([]); // sort & filter 된 List
const displayedList = ref([]); // tbody에 display 되는 dataList
const headers = computed({ // headerGroups에 의해 계산된 header 배열
  get() {
    if(props.headerGroups.length == 1) {
      return props.headerGroups[0];
    } else {
      let que = {};
      props.headerGroups.forEach(row => {
        let cursor = 0;
        row.forEach(col => {
          if(!col.grouping) {
            let flag = true;
            while(flag) {
              if(!que['col_' + cursor] || (que['col_' + cursor] && que['col_' + cursor].grouping)) {
                que['col_' + cursor++] = col;
                flag = false;
              } else {
                cursor++;
              }
            }
          } else {
            for(let i = 0; i < col.grouping.colspan; i++) {
              que['col_' + cursor++] = col;
            }
          }
        });
      });
      let rtn = [];
      for(let i = 0; i < Object.keys(que).length; i++) {
        rtn.push(que['col_' + i]);
      }
      return rtn;
    }
  },
  set(value) {
    if(props.headerGroups.length == 1) {
      return props.headerGroups[0];
    } else {
      let que = {};
      props.headerGroups.forEach(row => {
        let cursor = 0;
        row.forEach(col => {
          if(!col.grouping) {
            let flag = true;
            while(flag) {
              if(!que['col_' + cursor] || (que['col_' + cursor] && que['col_' + cursor].grouping)) {
                que['col_' + cursor++] = col;
                flag = false;
              } else {
                cursor++;
              }
            }
          } else {
            for(let i = 0; i < col.grouping.colspan; i++) {
              que['col_' + cursor++] = col;
            }
          }
        });
      });
      let rtn = [];
      for(let i = 0; i < Object.keys(que).length; i++) {
        rtn.push(que['col_' + i]);
      }
      rtn = value;
    }
  }
});

const selectedRow = ref({}); // 현재 선택된 row

const topBufferDiv = reactive({ height: 0 }); // tbody display 되는 data 위쪽 buffer div의 높이
const bottomBufferDiv = reactive({ height: 0 }); // tbody display 되는 data 아래쪽쪽 buffer div의 높이

const loadSizeHeight = computed(() => props.height * props.vPanelSize); // tbody에 display 되는 layer size 높이
const totalScrollableHeight = computed(() => sortedFilteredList.value.length * props.maxRowHeight);

function openEditor(index, col) {
  if(props.readonly) return;
  editor.value.index = index;
  editor.value.key = col.key;
}

function closeEditor() {
  editor.value.index = -1;
  editor.value.key = -1;
}

function eventTest(event) {
  console.log(event)
}

// methods
function setList(list) { 
  if(watcher.on) toggleWatcher(false);

  // grid init 역할을 하고 있는데 혹시 필요시 method 분리 필요
  // 변수 초기화
  pGridUniqueIndex = 0;
  sortList = [];

  // refs 초기화
  searchText.value = "";
  filterList.value = [];
  selectedRow.value = {};
  closeEditor();

  // headers 초기화
  headers.value.forEach(col => {
    if(col.filter) col.filter = false;
    if(col.filterText) col.filterText = '';
    if(col.sort) col.sort = '';
  });

  // list에 unique index 부여
  list.forEach(item => {
    item.pGridUniqueIndex = pGridUniqueIndex++;
  });

  // orglist는 혹시나 restore 기능 넣을까봐 일단 넣어둠
  //orglist = [...list]; // shallow copy
  orglist = JSON.parse(JSON.stringify(list)); // deep copy
  sortedFilteredList.value = JSON.parse(JSON.stringify(list));
  unFilterList = [...sortedFilteredList.value];

  // 최초 display
  displayData();
  
  if(!watcher.on) toggleWatcher(true);
}

function getList() {
  return sortedFilteredList.value;
}

function getUnFilterList() {
  return unFilterList;
}

function displayData() {
  if(watcher.on) toggleWatcher(false);

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

  if(!watcher.on) toggleWatcher(true);
}

// filter Dialog 함수
function showFilter(event, col) {
  filterDialog.value.open(event, col);
}

// sort & filter 함수
function doSortFilter(col) {
  if(watcher.on) toggleWatcher(false);
  // 각각 서로 호출하게 하면 결국 순환 참조 오류가 생겨서 하나로 묶어야 함 (filter function + sort function)
 
  // 일단 정렬 없는 원래 상태로 복구
  sortedFilteredList.value.sort((a, b) => a.pGridUniqueIndex - b.pGridUniqueIndex);

  // 필터 없는 원래 상태로 복구
  sortedFilteredList.value = [...unFilterList]; 

  // FILTER START
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
  // grid 상단 filterText
  if(searchText.value.length > 0) {
    sortedFilteredList.value = sortedFilteredList.value.filter(item => {
      let rtn = false;
      headers.value.forEach(value => {
        if(String(item[value.key]).includes(searchText.value)) rtn = true;
      })
      return rtn;
    });
  }
  // grid Header filterList
  if(filterList.value.length > 0) {
    sortedFilteredList.value = sortedFilteredList.value.filter(item => {
      let rtn = true;
      filterList.value.forEach(value => {
        if(!String(item[value.key]).includes(value.filterText)) rtn = false;
      });
      return rtn;
    });
  }
  // 필터 실행되지 않은 경우에는
  if(!(searchText.value.length > 0 || filterList.value.length > 0)) {
    unFilterList = [...sortedFilteredList.value]; // unFilterList에 보존
  }
  // FILTER END

  // SORT START
  if(col) {
    let index = sortList.findIndex((value) => value.key == col.key);
    if(index > -1) sortList.splice(index, 1); // sortList 배열에서 현재 선택한 col 정보 삭제

    if(!col.sort || col.sort == '') {
      sortList.push({key: col.key, sortType: 'asc', dataType: col.dataType}); // sortList 배열에 현재 선택한 col 정보 입력
      sortedFilteredList.value.sort((a, b) => compare(a, b)); // 정렬 실행

      col.sort = mdi.mdiChevronUp; // header icon 변경
    } else if (col.sort == mdi.mdiChevronUp){
      sortList.push({key: col.key, sortType: 'desc', dataType: col.dataType});
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
  // SORT END

  displayData(); // display 함수 호출

  if(!watcher.on) toggleWatcher(true);
}

// custom 비교 함수
function compare(a, b) {
  let rtn = 0; // result 값 a가 b보다 클 경우 양수, 같을 경우 0, 작을 경우 음수라고 한다
  for(let i = 0; i < sortList.length; i++) { // 뭐 양수, 음수는 반대로 적은 걸수도 있는데 중요한건 0이 같다는 거고
    if(rtn == 0) { // 그러므로 sortList를 순차적으로 순회하면서 결과가 0 (앞선 순번 비교에서 동일한 경우) 인 경우
      // 다음 차례의 비교를 수행하고 0이 아닐 경우 해당 비교로 rtn을 return한다
      if(sortList[i].sortType == 'asc') {
        let key = sortList[i].key;
        if(sortList[i].dataType == 'number') rtn = a[key] - b[key];
        else if(sortList[i].dataType == 'string') rtn = a[key].localeCompare(b[key]);
        else rtn = String(a[key]).localeCompare(String(b[key]));
      }
      if(sortList[i].sortType == 'desc') {
        let key = sortList[i].key;
        if(sortList[i].dataType == 'number') rtn = b[key] - a[key];
        else if(sortList[i].dataType == 'string') rtn = b[key].localeCompare(a[key]);
        else rtn = String(b[key]).localeCompare(String(a[key]));
      }
    }
  }
  return rtn;
}

// sort & filter 없애기
function restoreSortFilter() {
  if(watcher.on) toggleWatcher(false);
  sortList = [];
  searchText.value = "";
  filterList.value = [];
  selectedRow.value = {};
  closeEditor();

  headers.value.forEach(col => {
    if(col.filter) col.filter = false;
    if(col.filterText) col.filterText = '';
    if(col.sort) col.sort = '';
  });

  doSortFilter();
  if(!watcher.on) toggleWatcher(true);
}

// edit 전 상태로 data 복구
function restoreData() {
  if(watcher.on) toggleWatcher(false);

  //sortedFilteredList.value = [...orglist];
  sortedFilteredList.value = JSON.parse(JSON.stringify(orglist));
  unFilterList = [...sortedFilteredList.value];
  closeEditor();
  doSortFilter();

  if(!watcher.on) toggleWatcher(true);
}

// add row
function addRow(param) {
  if(watcher.on) toggleWatcher(false);
  
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

  let selectedIndex = sortedFilteredList.value.findIndex((value) => value == selectedRow.value);
  if(selectedIndex > -1) sortedFilteredList.value.splice(selectedIndex, 0, newRow); // 선택한 행이 있으면 선택한 행 앞에 추가
  else { // 선택한 행이 없을 땐 맨 앞에 추가하고 맨 위로 이동
    sortedFilteredList.value.unshift(newRow); // 배열에 추가
    mainDiv.value.scrollTop = 0; // 스크롤 이동
  }
  
  displayData(); // display 함수 호출

  if(!watcher.on) toggleWatcher(true);
}

// delete row
function deleteRow(row) {
  if(watcher.on) toggleWatcher(false);

  if(row) {
    selectRow(row);
  }

  let selectedIndex = sortedFilteredList.value.findIndex((value) => value == selectedRow.value);
  if(selectedIndex == -1) {
    alert("먼저 삭제할 행을 선택하시기 바랍니다.");
    return;
  }
  
  if(selectedRow.value.crud && selectedRow.value.crud == "C") {
    sortedFilteredList.value.splice(selectedIndex, 1);
    selectedRow.value = {};
  } else if (selectedRow.value.crud == "D") { 
    selectedRow.value.crud = "U";
  } else {
    selectedRow.value.crud = "D";
  }

  displayData(); // display 함수 호출
  
  if(!watcher.on) toggleWatcher(true);
}

// select row
function selectRow(item) {
  if(watcher.on) toggleWatcher(false);
  selectedRow.value = item;
  emit('selectRow', item);
  if(!watcher.on) toggleWatcher(true);
}

// 조건부 class
function getClass(location, param) {
  let rtn = '';
  if(location == 'tbody td') {
    if(param.crud && param.crud == 'D') rtn += ' deleted';
    if(selectedRow.value == param) rtn += ' selected';
  }
  return rtn;
}

// watch
const watcher = {
  default: null,
  on: false,
};
function toggleWatcher(bool) {
  watcher.on = bool;
  if(bool) {
    watcher.default = watch(sortedFilteredList, () => {
      let selectedIndex = sortedFilteredList.value.findIndex((value) => value == selectedRow.value);
      if(selectedIndex == -1) return; //처음 selected 없을때 error
      if(selectedRow.value.crud && selectedRow.value.crud == 'C') return; //생성된 자료는 U로 업데이트 하면 안됨
      selectedRow.value.crud = 'U';
    }, { deep: true });

    if(props.watcherList) {
      props.watcherList.forEach((value) => {
        watcher[value] = watch(() => {
          if(selectedRow.value.pGridUniqueIndex) return sortedFilteredList.value[selectedRow.value.pGridUniqueIndex][value]; 
        }, (val, oldVal) => {
          if(oldVal) {
            emit('onValueChange', {
              val: val,
              oldVal: oldVal,
              selected: selectedRow.value,
              column: value,
            });
          }
        });
      });
    }
  } else {
    if(watcher.default) watcher.default();
    watcher.default = null;
    if(props.watcherList) {
      props.watcherList.forEach((value) => {
        if(watcher[value]) watcher[value]();
        watcher[value] = null;
      });
    }
  }
}
</script>

<style scoped>
@import './PGrid.css';
</style>