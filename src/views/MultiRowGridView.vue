<template>
  <PGrid ref="PGrid"
    title="Multi-Row Grid"
    width="600"
    :headerGroups="headerGroups"
    :height="300"
    :max-row-height="26"
    :v-panel-size="1"
  >
    <template v-slot:body="{ item, column }">
      <input type="text" v-model="item[column]" />
    </template>
  </PGrid>
  <a href="javascript:;" @click="getData">getData</a>
  <div>
    <br>
    <div v-for="out in outData" :key="out">
      {{ out }}
    </div>
  </div>
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

export default {
  components: {
    PGrid,
  },
  data: () => ({
    outData: [],
    outUnFilterData: [],
    data: [
      {no: 1, name: 'A', age: 10, nickname: '오리'},
      {no: 2, name: 'A', age: 10, nickname: '오리'},
      {no: 2, name: 'B', age: 15, nickname: '산'},
      {no: 3, name: 'B', age: 15, nickname: '산'},
      {no: 3, name: 'B', age: 15, nickname: '산'},
      {no: 3, name: 'C', age: 15, nickname: '해수면'},
      {no: 4, name: 'C', age: 15, nickname: '해수면'},
      {no: 4, name: 'C', age: 20, nickname: '해수면'},
      {no: 5, name: 'C', age: 22, nickname: '해수면'},
    ],
    headerGroups: [
      [ // row 1 (top row)
        { title: 'NO', key: 'no', dataType: 'number', width: 100, align: 'center', },
        { title: 'INFORMATION', grouping: {colspan: 3} },
      ],
      [ // row 2 (second row)
        { title: 'NAME', key: 'name', dataType: 'string', align: 'center', editType: 'text', },
        { title: 'AGE', key: 'age', dataType: 'number', align: 'center', },
        { title: 'NICKNAME', key: 'nickname', dataType: 'string', width: 200, 
          align: 'right', customSlot: true, },
      ]
    ]
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