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
  <svg-icon type="mdi" :path="mdi.mdiMagnify" @click="openDialog" />
  <PFilterDialog ref="dialog"></PFilterDialog>
</template>

<script>
import * as mdi from '@mdi/js';
import PGrid from '@/components/PGrid/PGrid.vue';
import PFilterDialog from '@/components/PGrid/PFilterDialog.vue';

export default {
  components: {
    PGrid,
    PFilterDialog,
  },
  data: () => ({
    mdi,
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
    openDialog() {
      this.$refs.dialog.open();
    },
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
  background-color: black;
}

tbody tr:nth-child(even) td {
  background-color: grey;
}
</style>