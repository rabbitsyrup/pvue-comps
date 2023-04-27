<template>
  <PDialog 
    :title="'Filter'"
    :width="300"
    v-model:show="show">
    123<br>
    123<br>
    123<br>
    123
  </PDialog>
</template>

<script>
import { ref } from 'vue';
import PDialog from '@/components/PDialog/PDialog.vue';

export default {
    components: {
      PDialog,
    },
    emits: [
        
    ],
    props: {

    },
    setup(props,) {
      const show = ref(false);
      
      function open() {
        show.value = true;
      }
      
      return {
        show,

        //function
        open,
      }
    },
  }
</script>

<style scoped>

</style>