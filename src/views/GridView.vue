<template>
  <PGrid ref="PGrid"
    :name="'PGrid'"
    :headers="columns"
    :height="300"
    :width="600"
  >
  </PGrid>
  <a href="javascript:;" @click="setGrid">Data Reset</a>
</template>

<script>
import PGrid from '@/components/PGrid/PGrid.vue';

export default {
  components: {
    PGrid,
  },
  data: () => ({
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
    columns: [
      { title: 'NO', key: 'no', 
        headerStyle: { width: '100px' }, 
        bodyStyle: { textAlign: 'right' }} ,
      { title: 'NAME', key: 'name', 
        bodyStyle: { textAlign: 'right' }},
      { title: 'AGE', key: 'age', 
        bodyStyle: { textAlign: 'right' }},
      { title: 'NICKNAME', key: 'nickname', 
        headerStyle: { width: '200px' }, 
        bodyStyle: { textAlign: 'right' }},
    ],
  }),
  mounted() {
    this.$refs.PGrid.setList(this.data);
  },
  methods: {
    setGrid() {
      this.$refs.PGrid.setList(this.data);
    },
  }
}
</script>