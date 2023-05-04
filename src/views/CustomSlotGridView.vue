<template>
  <PGrid ref="PGrid"
    title="Custom Slot Grid"
    width="500"
    :headerGroups="headerGroups"
    :height="300"
    :codeList="codeList"
    :fixed-row="1"
    row-height="26px"
    :watcherList="['nickname']"
    @valueChange="onValueChange"
    @selectRow="onSelectRow"
  >
    <template v-slot:body="{ item, column }">
      <div style="height: 26px;">
        <PSelect style="width: 100%;"
          v-model="item[column]" 
          :items="getCodeList(item['country'])" 
          code="cd" name="cd_nm"/>
      </div>
    </template>
  </PGrid>
  <div>
    성능을 위해 wathcerList에 기재된 column만 watch에서 실시간 tracking합니다.<br>
    onValueChange(event) => 대상 컬럼 : NICKNAME<br>
    event.val: {{ event.val }}<br>
    event.oldVal: {{ event.oldVal }}<br>
    event.column: {{ event.column }}<br>
    event.selected: {{ event.selected }}<br>
  </div>
  <hr>
  <div>
    onSelectRow(event)<br>
    event: {{ selected }}
  </div>
</template>

<script>
import PGrid from '@/components/PGrid/PGrid.vue';
import PSelect from '@/components/PSelect/PSelect.vue';

export default {
  components: {
    PGrid,
    PSelect
  },
  data: () => ({
    event: {},
    selected: {},
    outData: [],
    outUnFilterData: [],
    data: [
      {no: 1, name: 'A', age: 10, nickname: '오리', country: 'KO', city: 'SE'},
      {no: 2, name: 'A', age: 10, nickname: '오리', country: 'KO', city: 'BU'},
      {no: 2, name: 'B', age: 15, nickname: '산', country: 'AM', city: 'NE'},
      {no: 3, name: 'B', age: 15, nickname: '산', country: 'AM', city: 'SA'},
      {no: 3, name: 'B', age: 15, nickname: '산', country: 'AM', city: 'SA'},
      {no: 3, name: 'C', age: 15, nickname: '해수면', country: 'KO', city: 'SE'},
      {no: 4, name: 'C', age: 15, nickname: '해수면', country: 'KO', city: 'BU'},
      {no: 4, name: 'C', age: 20, nickname: '해수면', country: 'EN', city: 'LU'},
      {no: 5, name: 'C', age: 22, nickname: '해수면', country: 'EN', city: 'MC'},
    ],
    headerGroups: [
      [ // row 1 (top row)
        { title: 'NO', key: 'no', dataType: 'number', width: 100, align: 'center', },
        { title: 'INFORMATION', grouping: {colspan: 3} },
        { title: 'COUNTRY', key: 'country', dataType: 'string', align: 'center', width: 150, editType: 'select' },
        { title: 'CITY', key: 'city', dataType: 'string', align: 'center', width: 120, customSlot: true, },
      ],
      [ // row 2 (second row)
        { title: 'NAME', key: 'name', dataType: 'string', width: 180, align: 'center', editType: 'text', },
        { title: 'AGE', key: 'age', dataType: 'number', align: 'center', },
        { title: 'NICKNAME', key: 'nickname', dataType: 'string', width: 200, 
          align: 'right', editType: 'text', },
      ]
    ],
    codeList: {
      country: [
        {cd: 'KO', cd_nm: '한국'},
        {cd: 'AM', cd_nm: '미국'},
        {cd: 'EN', cd_nm: '영국'},
      ],
      city1: [
        {cd: 'SE', cd_nm: '서울'},
        {cd: 'BU', cd_nm: '부산'},
      ],
      city2: [
        {cd: 'NE', cd_nm: '뉴욕'},
        {cd: 'SA', cd_nm: '시에틀'},
      ],
      city3: [
        {cd: 'LU', cd_nm: '런던'},
        {cd: 'MC', cd_nm: '멘체스터'},
      ]
    }
  }),
  mounted() {
    this.$refs.PGrid.setList(this.data);
  },
  methods: {
    getCodeList(country) {
      if(country == "KO") {
        return this.codeList['city1'];
      } else if(country == "AM") {
        return this.codeList['city2'];
      } else {
        return this.codeList['city3'];
      }
    },
    onValueChange(event) {
      this.event = event;
    },
    onSelectRow(event) {
      this.selected = event;
    }
  },
}
</script>