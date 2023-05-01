<template>
  <PGrid ref="PGrid"
    title="Multi Header Grid"
    width="700"
    :headerGroups="headerGroups"
    :height="300"
    :codeList="codeList"
  />
  <a href="javascript:;" @click="getData">getData</a>
  <div>
    <br>
    <div v-for="out in outData" :key="out">
      {{ out }}
    </div>
  </div>
  <hr>
  <a href="javascript:;" @click="getUnFilterData">getUnFilterData</a>
  <div>
    <br>
    <div v-for="out in outUnFilterData" :key="out">
      {{ out }}
    </div>
  </div>
</template>

<script>
import PGrid from '@/components/PGrid/PGrid.vue';
import PSelect from '@/components/PSelect/PSelect.vue';

export default {
  components: {
    PGrid,
    PSelect
  },
  data: () => ({
    co: '',
    outData: [],
    outUnFilterData: [],
    data: [
      {no: 1, name: 'A', age: 10, nickname: '오리', country: 'KO'},
      {no: 2, name: 'A', age: 10, nickname: '오리', country: 'KO'},
      {no: 2, name: 'B', age: 15, nickname: '산', country: 'AM'},
      {no: 3, name: 'B', age: 15, nickname: '산', country: 'AM'},
      {no: 3, name: 'B', age: 15, nickname: '산', country: 'AM'},
      {no: 3, name: 'C', age: 15, nickname: '해수면', country: 'KO'},
      {no: 4, name: 'C', age: 15, nickname: '해수면', country: 'KO'},
      {no: 4, name: 'C', age: 20, nickname: '해수면', country: 'EN'},
      {no: 5, name: 'C', age: 22, nickname: '해수면', country: 'EN'},
    ],
    headerGroups: [
      [ // row 1 (top row)
        { title: 'NO', key: 'no', dataType: 'number', width: 100, align: 'center', },
        { title: 'INFORMATION', grouping: {colspan: 3} },
        { title: 'COUNTRY', key: 'country', dataType: 'string', align: 'center', width: 100, editType: 'select' },
      ],
      [ // row 2 (second row)
        { title: 'NAME', key: 'name', dataType: 'string', align: 'center', editType: 'text', },
        { title: 'AGE', key: 'age', dataType: 'number', align: 'center', },
        { title: 'NICKNAME', key: 'nickname', dataType: 'string', width: 200, 
          align: 'right', editType: 'text', },
      ]
    ],
    codeList: {
      country: [
        {cd: 'KO', cd_nm: '한국'},
        {cd: 'AM', cd_nm: '미국'},
        {cd: 'EN', cd_nm: '영국'},
      ],
    }
  }),
  mounted() {
    this.$refs.PGrid.setList(this.data);
  },
  methods: {
    getData() {
      this.outData = this.$refs.PGrid.getList();
    },
    getUnFilterData() {
      this.outUnFilterData = this.$refs.PGrid.getUnFilterList();
    }
  },
}
</script>