<template>
  <v-app>
    <v-app-bar elevation="0">
      <v-app-bar-title class="text-h2 font-weight-bold text-center text-secondary">CWS BATCH TRACKER</v-app-bar-title>
    </v-app-bar>
    <v-main class="h-100">
      <VerticalCaroussel :excel-data="excelData" />
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import VerticalCaroussel from './components/VerticalCaroussel.vue';
import DepartureRow from './components/DepartureRow.vue';


const excelData = ref([]);

// Function to read Excel file
const readExcel = async () => {
  try {
    const result = await window.electronAPI.readExcel();
    if (result.success) {
      excelData.value = result.data.sort((a, b) => new Date(a.time) - new Date(b.time)); // Sort by time
    } else {
      console.error('Error:', result.error);
    }
  } catch (error) {
    console.error('Failed to read Excel:', error);
  }
};

// Read Excel and update periodically
onMounted(() => {
  readExcel(); // Initial read
  const intervalId = setInterval(readExcel, 60000); // Refresh every minute

  // Cleanup interval on unmount
  onUnmounted(() => {
    clearInterval(intervalId);
  });
});
</script>