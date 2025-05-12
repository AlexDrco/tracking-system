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

// Function to generate a random 7-character lot_number
const generateLotNumber = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 7; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

// Function to generate demo data
const generateDemoData = () => {
  const now = new Date();
  // Round to the nearest minute
  now.setSeconds(0, 0); // Reset seconds and milliseconds
  const startMinutes = now.getMinutes();
  now.setMinutes(startMinutes); // Start at the current minute

  const numberOfEntries = 14; // Generate 5 entries
  const data = [];

  for (let i = 0; i < numberOfEntries; i++) {
    // Calculate time with 3-minute increments
    const entryTime = new Date(now.getTime() + i * 3 * 60 * 1000); // Add 3 minutes per entry
    const hours = entryTime.getHours().toString().padStart(2, '0');
    const minutes = entryTime.getMinutes().toString().padStart(2, '0');
    const time = `${hours}:${minutes}`; // Format as HH:MM

    // Generate lot_number (7 characters)
    const lotNumber = generateLotNumber();

    // Alternate camera between "78" and "79"
    const camera = i % 2 === 0 ? '78' : '79';

    // Add entry to data
    data.push({
      time: time,
      lot_number: lotNumber,
      camera: camera,
    });
  }

  // Sort by time (though already sorted due to generation)
  data.sort((a, b) => {
    const [aHours, aMinutes] = a.time.split(':').map(Number);
    const [bHours, bMinutes] = b.time.split(':').map(Number);
    return aHours * 60 + aMinutes - (bHours * 60 + bMinutes);
  });

  excelData.value = data;
};

// // Function to read Excel file
// const readExcel = async () => {
//   try {
//     const result = await window.electronAPI.readExcel();
//     if (result.success) {
//       excelData.value = result.data.sort((a, b) => {
//         const [aHours, aMinutes] = a.time.split(':').map(Number);
//         const [bHours, bMinutes] = b.time.split(':').map(Number);
//         return aHours * 60 + aMinutes - (bHours * 60 + bMinutes);
//       }); // Sort by time
//     } else {
//       console.error('Error:', result.error);
//     }
//   } catch (error) {
//     console.error('Failed to read Excel:', error);
//   }
// };

// Read Excel and update periodically
onMounted(() => {
  generateDemoData(); // Generate demo data on load
  updateTime(); // Initial time update
  // const excelIntervalId = setInterval(readExcel, 60000); // Refresh Excel data every minute (commented out)
  const timeIntervalId = setInterval(updateTime, 1000); // Update time every second

  // Cleanup intervals on unmount
  onUnmounted(() => {
    // clearInterval(excelIntervalId);
    clearInterval(timeIntervalId);
  });
});
</script>