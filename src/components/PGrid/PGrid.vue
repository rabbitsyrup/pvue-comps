<template>
  <div class="mainDiv" 
    :style="mainDivStyle" ref="mainDiv" 
    @scroll="displayData($event)">
    <table>
      <thead>
        <tr>
          <th v-for="col in headers" :key="col" 
            :style="col.headerStyle">
            {{ col.title }}
          </th>
        </tr>
        <tr>
          <th v-for="col in headers" :key="col" 
            :style="col.headerStyle">
            {{ col.title }}
          </th>
        </tr>
        <tr>
          <th v-for="col in headers" :key="col" 
            :style="col.headerStyle">
            {{ col.title }}
          </th>
        </tr>
      </thead>
      <tfoot>
        <tr>
          <td v-for="col in headers" :key="col"
            :style="col.headerStyle">
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
            {{ row[col.key] }}
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

<script>
import { ref, reactive, computed, watch, onMounted } from 'vue';

export default {
  components: {
    
  },
  emits: [
    
  ],
  props: {
    headers: Array,
    list: Array,
    height: Number,
    rowHeight: {
      type: Number,
      default: 24 // tr한 행의 기본 높이 
      // css 전역적으로 변경될 경우 수정되어야 함
    },
    loadSize: {
      type: Number,
      default: 1 // 사전에 load 할 row 계수
      // 1로 하면 테이블 앞뒤로 4 ~ 10 row 정도 더 생겨서 적절할 것 같음
      // 이 계수를 늘리면 스크롤을 움직였을 때 미리 만들어두는 컴포넌트가 더 늘어나서
      // 움직였을 때 동작이 더 자연스럽게 보일 수 있음
    }
  },
  setup(props) {
    //refs
    const mainDiv = ref(null);

    //local data
    const displayedList = ref([]);
    const topBufferDiv = reactive({ height: 0 });
    const bottomBufferDiv = reactive({ height: 0 });
    const mainDivStyle = reactive({ height: props.height + 'px' });

    //compute
    const loadSize = computed(() => props.height * props.loadSize);
    const totalScrollableHeight = computed(() => props.list.length * props.rowHeight);

    //watch
    watch(props.list, () => displayData(), { deep:true });

    //lifecycle hook
    onMounted(() => displayData());

    //methods
    function displayData() {
      let scrollTop = 0;
      if(mainDiv.value) scrollTop = mainDiv.value.scrollTop;

      let startIndex = Math.floor(
        Math.max(0, scrollTop - loadSize.value) / props.rowHeight
      );
      let endIndex = Math.ceil(
        Math.min(totalScrollableHeight.value, (scrollTop + loadSize.value)) / props.rowHeight
      );

      displayedList.value = props.list.slice(startIndex, endIndex + 1);
      topBufferDiv.height = startIndex * props.rowHeight + 'px';
      bottomBufferDiv.height = Math.max(0, (props.list.length - endIndex - 1) * props.rowHeight) + 'px';
    }

    return {
      //refs
      mainDiv,
      
      //현재 보여지고 있는 목록
      displayedList,

      //table tbody 내의 상단 div / 하단 div 속성 객체
      topBufferDiv,
      bottomBufferDiv,

      //스타일 객체들
      mainDivStyle,

      displayData,
    }
  },
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
  background-color: grey;
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
  background-color: grey;
  position: sticky;
  bottom: 0;
  z-index: 1;
}
</style>