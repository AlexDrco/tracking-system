<template>
  <v-carousel show-arrows="hover" hide-delimiters>
    <v-carousel-item v-for="(chunk, chunkIndex) in excelChunks" :key="chunkIndex" cover>
      <DepartureRow
        v-for="(departure, index) in chunk"
        :key="index"
        :time="departure.time"
        :lot-number="departure.lot_number"
        :camera="departure.camera"
        :status="departure.status"
        class="ma-5"
      ></DepartureRow>
    </v-carousel-item>
  </v-carousel>
</template>

<script setup>
import { computed } from 'vue';
import DepartureRow from './DepartureRow.vue';

const props = defineProps({
  excelData: {
    type: Array,
    required: true,
  },
});

// Split excelData into chunks
const itemsPerSlide = 6; // For 4 slides with 6 departures each
const excelChunks = computed(() => {
  const chunks = [];
  for (let i = 0; i < props.excelData.length; i += itemsPerSlide) {
    chunks.push(props.excelData.slice(i, i + itemsPerSlide));
  }
  return chunks;
});
</script>