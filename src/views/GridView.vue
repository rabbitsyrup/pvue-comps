<template>
  <PGrid ref="PGrid"
    :name="'PGrid'"
    :headers="columns"
    :height="height"
  >
  </PGrid><span @click="setGrid">123</span>
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
        bodyStyle: { textAlign: 'left' }} ,
      { title: 'NAME', key: 'name', },
      { title: 'AGE', key: 'age', },
      { title: 'NICKNAME', key: 'nickname', 
        headerStyle: { width: '200px' }, 
        bodyStyle: { textAlign: 'right' }},
    ],
    height: 300,
    namePool: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'    
  }),
  mounted() {
    //this.createData();
    this.$refs.PGrid.setList(this.data);
  },
  methods: {
    setGrid() {
      this.$refs.PGrid.setList(this.data);
    },
    createData() {
      for(let i=1; i<=10; ++i) {
        this.data.push(
          {
            no: i,
            name: this.namePool.charAt(i),
            age: Math.floor((Math.random() * 30)+20),
            nickname: this.namePool.charAt(Math.floor(Math.random() * 24)) + this.namePool.charAt(Math.floor(Math.random() * 24))
          }
        ) 
      }
    }
  }
}
</script>

<style>
tbody tr:nth-child(odd) td {
  background-color: black;
}
tbody tr:nth-child(even) td {
  background-color: grey;
}
</style>