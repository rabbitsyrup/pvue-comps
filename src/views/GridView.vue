<template>
  <PGrid ref="PGrid"
    title="V-Scroll Grid"
    width="700"
    :headerGroups="headerGroups"
    :height="500"
    :codeList="codeList"
  />
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
        { title: 'NO', key: 'no', dataType: 'number', align: 'center', width: 80, editType: 'text', } ,
        { title: 'NAME', key: 'name', dataType: 'string', align: 'center', width: 100, editType: 'text', },
        { title: 'NICKNAME', key: 'nickname', dataType: 'string', align: 'right', editType: 'text', },
        { title: 'AGE', key: 'age', dataType: 'number', align: 'center', width: 80, editType: 'text', },
        { title: 'COUNTRY', key: 'country', dataType: 'string', align: 'center', width: 100, editType: 'select' },
        { title: 'CITY', key: 'city', dataType: 'string', align: 'center', width: 100, editType: 'select' },
      ]
    ],
    namePool: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    codeList: {
      country: [
        {cd: 'KO', cd_nm: '한국'},
        {cd: 'AM', cd_nm: '미국'},
        {cd: 'EN', cd_nm: '영국'},
      ],
      city: [
        {cd: 'SE', cd_nm: '서울'},
        {cd: 'BU', cd_nm: '부산'},
      ]
    }
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
            nickname: this.namePool.charAt(Math.floor(Math.random() * 24)) + this.namePool.charAt(Math.floor(Math.random() * 24)),
            country: '',
            city: ''
          }
        ) 
      }
    }
  }
}
</script>