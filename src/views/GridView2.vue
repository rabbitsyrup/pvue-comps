<template>
  <PGrid ref="PGrid"
    :name="'PGrid'"
    :headers="columns"
    :height="height"
    :max-row-height="50"
    :v-panel-size="2"
  >
    <template v-slot:body="{ item, column }">
      {{ item[column] }}
      <br>
      {{ item[column] }}
    </template>
  </PGrid>
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
    this.createData();
    this.$refs.PGrid.setList(this.data);
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