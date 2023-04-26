<template>
  <PGrid ref="PGrid"
    :name="'PGrid'"
    :list="data"
    :headers="columns"
    :height="height"
  >
  </PGrid>
  <svg-icon type="mdi" :path="mdiMagnify" @click="createData" />
</template>

<script>
import { mdiMagnify } from '@mdi/js';
import PGrid from '@/components/PGrid/PGrid.vue';

export default {
  components: {
    PGrid,
  },
  data: () => ({
    mdiMagnify: mdiMagnify,
    data: [],
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
  },
  methods: {
    createData() {
      for(let i=1; i<=5000; ++i) {
        this.data.push(
          {
            no: i,
            name: this.namePool.charAt(Math.floor(Math.random() * 24)),
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
  background-color: red;
}

tbody tr:nth-child(even) td {
  background-color: blue;
}
</style>