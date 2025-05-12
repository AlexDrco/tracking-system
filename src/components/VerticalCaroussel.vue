<template>
    <v-container fluid class="h-100">
        <v-sheet>
            <DepartureRow time="TIME" lotNumber="LOT NUM" camera="CAM" status="STATUS"/>
            <v-divider thickness="5" class="my-5"></v-divider>
        </v-sheet>
        <v-sheet height="85vh" max-height="75vh">
            <!-- Vertical v-slide-group for scrolling rows -->
            <v-slide-group v-model="currentWindow" direction="vertical" center-active>
                <template v-slot:next>
                    <div></div>
                </template>
                <template v-slot:prev>
                    <div></div>
                </template>
                <v-slide-group-item v-for="(item, index) in excelData" :key="index" v-slot="{ isSelected, toggle }">
                    <v-card
                        color="transparent"
                        :variant="isSelected ? 'outlined' : 'text'"
                        @click="toggle"
                        :class="[
                            isCurrentTime(item.time) ? ['bg-blue', 'bg-opacity-50'] : withinNext30Minutes(item.time) ? ['bg-orange', 'bg-opacity-50'] : 'opacity-50',
                            'ma-2',
                            'transition'
                        ]"
                    >
                        <DepartureRow
                            :time="item.time"
                            :lotNumber="item.lot_number"
                            :camera="item.camera"
                            :status="getItemStatus(item.time, isCurrentTime(item.time))"
                        />
                    </v-card>
                </v-slide-group-item>
            </v-slide-group>
        </v-sheet>
    </v-container>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import DepartureRow from './DepartureRow.vue';

const props = defineProps({
    excelData: {
        type: Array,
        required: true,
        default: () => [],
    },
    currentTime: {
        type: String,
        required: true,
        default: '',
    },
});

const currentWindow = ref(0); // Tracks the current center item index

// Check if an item's time matches the current time
const isCurrentTime = (itemTime) => {
    if (!props.currentTime || !itemTime) return false;

    // Extract HH:MM from currentTime (HH:MM:SS)
    const timeParts = props.currentTime.split(':');
    const currentTimeWithoutSeconds = `${timeParts[0]}:${timeParts[1]}`; // e.g., "14:30"

    // Compare directly
    return itemTime === currentTimeWithoutSeconds;
};

// Check if an item's time is within the next 30 minutes
const withinNext30Minutes = (itemTime) => {
    if (!props.currentTime || !itemTime) return false;

    // Extract HH:MM from currentTime (HH:MM:SS)
    const timeParts = props.currentTime.split(':');
    const currentTimeWithoutSeconds = `${timeParts[0]}:${timeParts[1]}`; // e.g., "14:30"

    // Convert current time (HH:MM) to minutes
    const [currentHours, currentMinutes] = currentTimeWithoutSeconds.split(':').map(Number);
    const currentTotalMinutes = currentHours * 60 + currentMinutes;

    // Convert item.time (HH:MM) to minutes
    const [itemHours, itemMinutes] = itemTime.split(':').map(Number);
    const itemTotalMinutes = itemHours * 60 + itemMinutes;

    // Check if item time is within the next 30 minutes
    const diff = itemTotalMinutes - currentTotalMinutes;
    return diff > 0 && diff <= 1; // Future time within 30 minutes (corrected to 30 minutes)
};

// Determine the status of an item based on its time
const getItemStatus = (itemTime, isCurrent) => {
    if (!props.currentTime || !itemTime) return 'WAITING';

    // Extract HH:MM from currentTime (HH:MM:SS)
    const timeParts = props.currentTime.split(':');
    const currentTimeWithoutSeconds = `${timeParts[0]}:${timeParts[1]}`; // e.g., "14:30"

    // Convert current time (HH:MM) to minutes
    const [currentHours, currentMinutes] = currentTimeWithoutSeconds.split(':').map(Number);
    const currentTotalMinutes = currentHours * 60 + currentMinutes;

    // Convert item.time (HH:MM) to minutes
    const [itemHours, itemMinutes] = itemTime.split(':').map(Number);
    const itemTotalMinutes = itemHours * 60 + itemMinutes;

    // Determine status
    const diff = itemTotalMinutes - currentTotalMinutes;
    if (diff < 0) {
        return 'COMPLETE'; // Time has passed
    } else if (isCurrent) {
        return 'RUNNING'; // Current time
    } else if (diff > 0 && diff <= 30) {
        return 'PREPARE'; // Within next 30 minutes
    } else {
        return 'WAITING'; // More than 30 minutes in the future
    }
};

// Update current window based on current time
const updateCurrentWindow = () => {
    if (!props.currentTime || props.excelData.length === 0) return;

    // Extract HH:MM from currentTime (HH:MM:SS)
    const timeParts = props.currentTime.split(':');
    const timeWithoutSeconds = `${timeParts[0]}:${timeParts[1]}`; // e.g., "14:30"

    // Find all active items (matching current time)
    const activeIndices = [];
    props.excelData.forEach((item, index) => {
        if (isCurrentTime(item.time)) {
            activeIndices.push(index);
        }
    });

    if (activeIndices.length > 0) {
        // If there are active items, prioritize the second one if available
        if (activeIndices.length >= 2) {
            currentWindow.value = activeIndices[1]; // Center the second active item
        } else {
            currentWindow.value = activeIndices[0]; // Center the only active item
        }
        return;
    }

    // Fallback: Find the closest item if no active items
    let closestIndex = 0;
    let minDiff = Infinity;

    props.excelData.forEach((item, index) => {
        // Convert item.time (HH:MM) to minutes for comparison
        const [itemHours, itemMinutes] = item.time.split(':').map(Number);
        const itemTotalMinutes = itemHours * 60 + itemMinutes;

        // Convert timeWithoutSeconds (HH:MM) to minutes
        const [currentHours, currentMinutes] = timeWithoutSeconds.split(':').map(Number);
        const currentTotalMinutes = currentHours * 60 + currentMinutes;

        // Calculate absolute difference in minutes
        const diff = Math.abs(currentTotalMinutes - itemTotalMinutes);

        if (diff < minDiff) {
            minDiff = diff;
            closestIndex = index;
        }
    });

    // Set the closest item as the selected item
    currentWindow.value = closestIndex;
};

// Watch for changes in excelData or currentTime and update window
watch(
    [() => props.excelData, () => props.currentTime],
    () => {
        if (props.excelData.length > 0 && props.currentTime) {
            updateCurrentWindow();
        }
    },
    { deep: true }
);

// Initial update on mount
onMounted(() => {
    if (props.excelData.length > 0 && props.currentTime) {
        updateCurrentWindow();
    }
});
</script>