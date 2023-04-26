<template>
    <PGrid ref="PGrid"
      :name="'PGrid'"
      :list="data"
      :headers="columns"
      :height="height"
    >
    </PGrid>
    <span @click="createData">createData</span>
  </template>
  
  <script>
  import PGrid from '@/components/PGrid/PGrid.vue';
  
  export default {
    components: {
      PGrid,
    },
    data: () => ({
      data: [],
      columns: [
        { title: 'NO', key: 'no', headerStyle: { width: '100px' }, bodyStyle: { textAlign: 'center' }} ,
        { title: 'NAME', key: 'name', bodyStyle: { textAlign: 'right', backgroundColor: 'grey' } },
        { title: 'AGE', key: 'age', headerStyle: { textAlign: 'center' }},
        { title: 'NICKNAME', key: 'nickname', headerStyle: { width: '200px' }, bodyStyle: { textAlign: 'right', backgroundColor: 'grey' }},
      ],
      height: 300,
      namePool: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'    
    }),
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