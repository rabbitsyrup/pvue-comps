<template>
  <PGrid ref="PGrid"
    title="V-Scroll Grid"
    width="600"
    :headerGroups="headerGroups"
    :height="500"
  >
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
    headerGroups: [
      [
        { title: 'NO', key: 'no', dataType: 'number', width: 100, align: 'center', } ,
        { title: 'NAME', key: 'name', dataType: 'string', align: 'center', editType: 'text', },
        { title: 'AGE', key: 'age', dataType: 'number', align: 'center', },
        { title: 'NICKNAME', key: 'nickname', dataType: 'string', width: 200, align: 'right', },
      ]
    ],
    namePool: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  }),
  mounted() {
    this.createData();
    this.$refs.PGrid.setList(this.data);
  },
  methods: {
    createData() {
      for(let i = 1; i <= 10000; ++i) {
        this.data.push(
          {
            no: i,
            name: this.namePool.charAt(Math.floor(Math.random() * 24)),
            age: Math.floor((Math.random() * 30) + 20),
            nickname: this.namePool.charAt(Math.floor(Math.random() * 24)) + this.namePool.charAt(Math.floor(Math.random() * 24))
          }
        ) 
      }
    }
  }
}
</script>