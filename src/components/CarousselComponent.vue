<template>
    <v-carousel show-arrows="hover" hide-delimiters>
        <v-carousel-item v-for="(chunk, chunkIndex) in departureChunks" :key="chunkIndex" cover>
            <DepartureRow v-for="(departure, index) in chunk" :key="index" :time="departure.time"
                :destination="departure.destination" :gate="departure.gate" :status="departure.status" class="ma-5" />
        </v-carousel-item>
    </v-carousel>
</template>

<script setup>
import { computed } from 'vue';
import DepartureRow from './DepartureRow.vue';

// Hardcoded source data (replace with file data later)
const departures = [
    { time: "12:30", destination: "New York", gate: "A12", status: "On Time" },
    { time: "13:00", destination: "London", gate: "B05", status: "Boarding" },
    { time: "13:15", destination: "Tokyo", gate: "C23", status: "Gate Open" },
    { time: "13:30", destination: "Paris", gate: "A07", status: "On Time" },
    { time: "14:00", destination: "Sydney", gate: "D14", status: "Cancelled" },
    { time: "14:30", destination: "Dubai", gate: "E09", status: "On Time" },
    { time: "15:00", destination: "Chicago", gate: "F22", status: "Boarding" },
    { time: "15:15", destination: "Miami", gate: "A03", status: "On Time" },
    { time: "15:30", destination: "Berlin", gate: "B11", status: "Gate Open" },
    { time: "16:00", destination: "Toronto", gate: "C08", status: "On Time" },
    { time: "16:30", destination: "Singapore", gate: "D19", status: "Cancelled" },
    { time: "17:00", destination: "Hong Kong", gate: "E06", status: "On Time" },
    { time: "17:30", destination: "Amsterdam", gate: "F15", status: "Boarding" },
    { time: "18:00", destination: "Los Angeles", gate: "A10", status: "On Time" },
    { time: "18:30", destination: "San Francisco", gate: "B04", status: "On Time" },
    { time: "19:00", destination: "Seattle", gate: "C12", status: "Gate Open" },
    { time: "19:30", destination: "Boston", gate: "D07", status: "On Time" },
    { time: "20:00", destination: "Vancouver", gate: "E03", status: "Boarding" },
    { time: "20:30", destination: "Rome", gate: "F20", status: "On Time" },
    { time: "21:00", destination: "Madrid", gate: "A05", status: "Cancelled" },
    { time: "21:30", destination: "Athens", gate: "B09", status: "On Time" },
    { time: "22:00", destination: "Cairo", gate: "C14", status: "Boarding" },
    { time: "22:30", destination: "Bangkok", gate: "D11", status: "On Time" },
    { time: "23:00", destination: "Istanbul", gate: "E08", status: "Gate Open" },
];

// Split departures into chunks
const itemsPerSlide = 6; // For 2 slides with 12 departures each
// const itemsPerSlide = 6; // For 4 slides with 6 departures each
const departureChunks = computed(() => {
    const chunks = [];
    for (let i = 0; i < departures.length; i += itemsPerSlide) {
        chunks.push(departures.slice(i, i + itemsPerSlide));
    }
    return chunks;
});
</script>