<template>
    <v-app class="bd-tech-background">
        <v-main class="pa-0">
            <v-container fluid class="pa-0 h-100">
                <v-card class="bd-card" elevation="0" style="height: 100vh;">
                    <v-card-title class="bd-subtitle pa-2 d-flex justify-space-between">
                        <span class="text-primary text-h4">BATCH INFORMATION</span>
                        <v-chip color="#FFC107" variant="outlined" class="ml-2">
                            <v-icon start icon="mdi-refresh"></v-icon>
                            Auto-refresh: {{ taktTimeRefreshSeconds }}s
                        </v-chip>
                    </v-card-title>
                    <v-card-text class="pa-0">
                        <DepartureRow time="TIME" destination="LOT NUM" gate="CWS" status="STATUS" />
                        <v-divider thickness="2" class="my-1"></v-divider>
                        <CarousselComponent ref="taktTimeComponent"></CarousselComponent>
                    </v-card-text>
                </v-card>
            </v-container>
        </v-main>

    </v-app>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import CarousselComponent from './components/CarousselComponent.vue';
import DepartureRow from './components/DepartureRow.vue';

// Component references
const taktTimeComponent = ref(null);

// Current time display
const currentTime = ref('');
const lastUpdated = ref('');

// Convert takt time refresh interval from milliseconds to seconds
const taktTimeRefreshSeconds = computed(() => {
    if (taktTimeComponent.value) {
        return taktTimeComponent.value.refreshInterval / 1000;
    }
    return 8; // Default value in seconds
});

// Update time every second
const updateTime = () => {
    const now = new Date();
    currentTime.value = now.toLocaleTimeString('en-US', { hour12: false });
};

// Set last updated time
const updateLastUpdated = () => {
    const now = new Date();
    lastUpdated.value = now.toLocaleString('en-US', { 
        hour12: false,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
};

onMounted(() => {
    // Initial update
    updateTime();
    updateLastUpdated();
    
    // Set interval for time update
    setInterval(updateTime, 1000);
    
    // Set interval for last updated (simulating data refresh)
    setInterval(updateLastUpdated, 30000); // 30 seconds
});
</script>