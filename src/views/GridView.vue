<template>
  <PGrid ref="PGrid"
    title="V-Scroll Grid"
    width="700"
    :headerGroups="headerGroups"
    :height="500"
    row-height="26px"
    :v-row-height="26"
    :v-panel-size="1"
    :codeList="codeList"
    :readonly="readonly"
    :no-filter="noFilter"
    :no-add="noAdd"
    :no-delete="noDelete"
  />
  props 설명<hr>
  <a href="javascript:;" @click="noFilter = !noFilter">no-filter</a> 필터 제거<br>
  <a href="javascript:;" @click="readonly = !readonly">readonly</a> grid readonly (다량 데이터 랜더링 시 성능 향상)<br>
  (Caution) Data row를 추가한 후 readonly 상태를 변경하면 랜더링에 문제가 생깁니다.<br>
  readonly 상태에선 성능 향상을 위해 내부 data의 watch 상태를 중단시키기 때문입니다.<br>
  혹시 그런 업무를 처리해야 하는 상황이라면 아래 두 props를 이용하시면 됩니다.<br>
  <br>
  <a href="javascript:;" @click="noAdd = !noAdd">no-add</a> addRow 버튼 제거<br>
  <a href="javascript:;" @click="noDelete = !noDelete">no-del</a> deleteRow 버튼 제거<br>
  addRow 버튼 제거와 deleteRow 버튼 제거를 함께 사용할 경우 watch 중단 없는 readonly 상태가 됩니다.
</template>

<script>
import PGrid from '@/components/PGrid/PGrid.vue';

export default {
  components: {
    PGrid,
  },
  data: () => ({
    readonly: false,
    noFilter: false,
    noAdd: false,
    noDelete: false,
    data: [],
    headerGroups: [
      [
        { title: 'NO', key: 'no', dataType: 'number', align: 'center', width: 80, editType: 'text', } ,
        { title: 'NAME', key: 'name', dataType: 'string', align: 'center', width: 100, editType: 'text', },
        { title: 'NICKNAME', key: 'nickname', dataType: 'string', align: 'right', editType: 'text', },
        { title: 'AGE', key: 'age', dataType: 'number', align: 'center', width: 80, editType: 'text', },
        { title: 'COUNTRY', key: 'country', dataType: 'string', align: 'center', width: 100, 
          editType: 'select', codeList: 'country', codeValue: 'cd', codeTitle: 'cd_nm', }, 
          // defalut codeList는 key 값과 같음, codeValue와 codeTitle 값의 디폴트 값은 각각 cd, cd_nm
      ]
    ],
    namePool: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    codeList: {
      country: [
        {cd: 'KO', cd_nm: '한국'},
        {cd: 'AM', cd_nm: '미국'},
        {cd: 'EN', cd_nm: '영국'},
      ],
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
            country: this.codeList['country'][Math.floor((Math.random() * 3))]['cd'],
          }
        ) 
      }
    }
  }
}
</script>