<template>
  <select v-model="modelValue" @blur="blur">
    <option v-for="item in items" :key="item" :value="item[code]">
      {{ item[name] }}
    </option>
  </select>
</template>

<script setup>
import { computed } from 'vue';

const emit = defineEmits([
  'update:modelValue',
  'blur'
]);

const props = defineProps({
  modelValue: String,
  items: Array,
  code: String,
  name: String,
});

const modelValue = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit('update:modelValue', value);
  }
});

function blur() {
  emit('blur');
}
</script>