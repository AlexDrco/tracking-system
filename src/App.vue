<template>
  <v-app>
    <v-app-bar elevation="0">
      <v-app-bar-title class="text-h2 font-weight-bold text-center text-secondary">
        <div class="d-flex align-center justify-center" color="">
          <span>CWS BATCH TRACKER</span>
        </div>
      </v-app-bar-title>
                <span class="text-h4 text-cyan">{{ currentTime }}</span>

    </v-app-bar>
    <v-main class="h-100">
      <VerticalCaroussel :excel-data="excelData" :current-time="currentTime" />
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import VerticalCaroussel from './components/VerticalCaroussel.vue';
import DepartureRow from './components/DepartureRow.vue';

const excelData = ref([]);
const currentTime = ref('');

// Function to update the current time
const updateTime = () => {
  const now = new Date();
  currentTime.value = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).replace(/ /g, '');
};

// Function to read Excel file
const readExcel = async () => {
  try {
    const result = await window.electronAPI.readExcel();
    if (result.success) {
      excelData.value = result.data.sort((a, b) => {
        const [aHours, aMinutes] = a.time.split(':').map(Number);
        const [bHours, bMinutes] = b.time.split(':').map(Number);
        return aHours * 60 + aMinutes - (bHours * 60 + bMinutes);
      }); // Sort by time
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
  updateTime(); // Initial time update
  const excelIntervalId = setInterval(readExcel, 60000); // Refresh Excel data every minute
  const timeIntervalId = setInterval(updateTime, 1000); // Update time every second

  // Cleanup intervals on unmount
  onUnmounted(() => {
    clearInterval(excelIntervalId);
    clearInterval(timeIntervalId);
  });
});
</script>