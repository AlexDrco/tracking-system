<template>
    <v-container fluid class="h-100">
        <DepartureRow time="TIME" lotNumber="LOT NUM" camera="CAM" status="STATUS" />
        <v-divider thickness="5" class="my-5"></v-divider>
        <!-- Vertical v-slide-group for scrolling rows -->
        <v-slide-group v-model="currentWindow" direction="vertical" style="height: 85%">
            <v-slide-group-item v-for="(item, index) in visibleItems" :key="index">
                <v-card style="height: 85%" color="transparent" variant="text" class="d-flex align-center">
                    <DepartureRow :time="item.time" :lotNumber="item.lot_number" :camera="item.camera"
                        :status="item.status" />
                </v-card>
            </v-slide-group-item>
        </v-slide-group>
    </v-container>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import DepartureRow from './DepartureRow.vue';

const props = defineProps({
    excelData: {
        type: Array,
        required: true,
        default: () => [],
    },
});

const currentWindow = ref(0); // Tracks the current center item index

// Compute visible items (5 items: 2 above, 1 center, 2 below)
const visibleItems = computed(() => {
    const totalItems = props.excelData.length;
    if (totalItems < 5) return props.excelData; // Return all if less than 5 items

    const centerIndex = currentWindow.value;
    const startIndex = Math.max(0, centerIndex - 2); // 2 items before
    return props.excelData.slice(startIndex, startIndex + 5); // 5 items total
});

// Determine if the item is the center one (for focusing)
const isCenterItem = (index) => index === 2; // Center item is at index 2 of visibleItems

// Update current window based on current time
const updateCurrentWindow = () => {
    const now = new Date();
    let closestIndex = 0;
    let minDiff = Infinity;

    props.excelData.forEach((item, index) => {
        const itemTime = new Date(item.time);
        const diff = Math.abs(now - itemTime);
        if (diff < minDiff) {
            minDiff = diff;
            closestIndex = index;
        }
    });

    // Set the closest item as the center (adjust for visibleItems)
    currentWindow.value = Math.max(2, closestIndex);
};

// Watch for changes in excelData and update window
watch(
    () => props.excelData,
    () => {
        if (props.excelData.length > 0) {
            updateCurrentWindow();
        }
    },
    { deep: true }
);

// Initial update on mount
onMounted(() => {
    if (props.excelData.length > 0) {
        updateCurrentWindow();
    }
});
</script>