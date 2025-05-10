<template>
  <v-app>
    <v-app-bar>
      <v-app-bar-title class="text-h2 font-weight-bold text-center text-secondary">CWS BATCH TRACKER</v-app-bar-title>
    </v-app-bar>
    <v-main>
      <v-container fluid class="pa-0 h-100">
        <DepartureRow time="TIME" lotNumber="LOT NUM" camera="CAM" status="STATUS" />
        <v-divider thickness="5" class="my-5"></v-divider>
        <DepartureRow
          v-for="(item, index) in excelData"
          :key="index"
          :time="item.time"
          :lotNumber="item.lot_number"
          :camera="item.camera"
          :status="item.status"
        ></DepartureRow>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import CarousselComponent from './components/CarousselComponent.vue';
import DepartureRow from './components/DepartureRow.vue';

const excelData = ref([]);

// Function to read Excel file
const readExcel = async () => {
  try {
    const result = await window.electronAPI.readExcel();
    if (result.success) {
      excelData.value = result.data;
    } else {
      console.error('Error:', result.error);
    }
  } catch (error) {
    console.error('Failed to read Excel:', error);
  }
};

onMounted(() => {
  // Read immediately on mount
  readExcel();
  // Set interval to read every minute (60,000 ms)
  const intervalId = setInterval(readExcel, 60000);

  // Store intervalId in a ref or cleanup on unmount
  onUnmounted(() => {
    clearInterval(intervalId);
  });
});
</script>