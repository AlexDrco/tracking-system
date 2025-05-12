<template>
    <v-container fluid class="h-100">
        <v-sheet>
            <DepartureRow time="TIME" lotNumber="LOT NUM" camera="CWS" status="STATUS"/>
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
                            withinNext30Minutes(item.time) ? ['bg-orange', 'bg-opacity-50'] : isCurrentTime(item.time) ? ['bg-blue', 'bg-opacity-50'] : 'opacity-50',
                            'ma-2',
                            'transition'
                        ]"
                    >
                        <DepartureRow
                            :time="item.time"
                            :lotNumber="item.lot_number"
                            :camera="item.camera"
                            :status="getItemStatus(item.time)"
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

const timeRunning = 4; // Time window for "RUNNING" status (in minutes)
const timeToPrepare = 3; // Time window for "PREPARE" status (in minutes)

const currentWindow = ref(0); // Tracks the current center item index

const isCurrentTime = (itemTime) => {
    if (!props.currentTime || !itemTime) return false;

    // Extract HH:MM from currentTime (HH:MM:SS)
    const timeParts = props.currentTime.split(':');
    const currentTimeWithoutSeconds = `${timeParts[0]}:${timeParts[1]}`; // e.g., "18:27"

    // Convert current time (HH:MM) to minutes
    const [currentHours, currentMinutes] = currentTimeWithoutSeconds.split(':').map(Number);
    const currentTotalMinutes = currentHours * 60 + currentMinutes;

    // Convert item.time (HH:MM) to minutes
    const [itemHours, itemMinutes] = itemTime.split(':').map(Number);
    const itemTotalMinutes = itemHours * 60 + itemMinutes;

    // Step 1: Has the item's time happened? (currentTime >= item.time)
    const diff = itemTotalMinutes - currentTotalMinutes;
    const hasTimeHappened = diff <= 0;

    // Step 2: Is it within timeRunning? (within 4 minutes after item.time)
    const isWithinTimeRunning = diff >= -timeRunning;

    // Step 3: Return true only if both conditions are true
    console.log(`isCurrentTime: itemTime=${itemTime}, currentTime=${currentTimeWithoutSeconds}, diff=${diff}, hasTimeHappened=${hasTimeHappened}, isWithinTimeRunning=${isWithinTimeRunning}, result=${hasTimeHappened && isWithinTimeRunning}`);
    return hasTimeHappened && isWithinTimeRunning;
};

// Check if an item's time is in the future and within timeToPrepare
const withinNext30Minutes = (itemTime) => {
    if (!props.currentTime || !itemTime) return false;

    // Extract HH:MM from currentTime (HH:MM:SS)
    const timeParts = props.currentTime.split(':');
    const currentTimeWithoutSeconds = `${timeParts[0]}:${timeParts[1]}`; // e.g., "18:19"

    // Convert current time (HH:MM) to minutes
    const [currentHours, currentMinutes] = currentTimeWithoutSeconds.split(':').map(Number);
    const currentTotalMinutes = currentHours * 60 + currentMinutes;

    // Convert item.time (HH:MM) to minutes
    const [itemHours, itemMinutes] = itemTime.split(':').map(Number);
    const itemTotalMinutes = itemHours * 60 + itemMinutes;

    // Check if item time is in the future and within timeToPrepare
    const diff = itemTotalMinutes - currentTotalMinutes;
    return diff > 0 && diff <= timeToPrepare; // Future time within timeToPrepare
};

// Determine the status of an item based on its time
const getItemStatus = (itemTime) => {
    if (!props.currentTime || !itemTime) return 'WAITING';

    // Extract HH:MM from currentTime (HH:MM:SS)
    const timeParts = props.currentTime.split(':');
    const currentTimeWithoutSeconds = `${timeParts[0]}:${timeParts[1]}`; // e.g., "18:27"

    // Convert current time (HH:MM) to minutes
    const [currentHours, currentMinutes] = currentTimeWithoutSeconds.split(':').map(Number);
    const currentTotalMinutes = currentHours * 60 + currentMinutes;

    // Convert item.time (HH:MM) to minutes
    const [itemHours, itemMinutes] = itemTime.split(':').map(Number);
    const itemTotalMinutes = itemHours * 60 + itemMinutes;

    // Step 1: Has the item's time happened? (currentTime >= item.time)
    const diff = itemTotalMinutes - currentTotalMinutes;
    const hasTimeHappened = diff <= 0;

    // Step 2: Is it within timeRunning? (within 4 minutes after item.time)
    const isWithinTimeRunning = diff >= -timeRunning;

    // Step 3: Determine status
    console.log(`getItemStatus: itemTime=${itemTime}, currentTime=${currentTimeWithoutSeconds}, diff=${diff}, hasTimeHappened=${hasTimeHappened}, isWithinTimeRunning=${isWithinTimeRunning}`);
    if (hasTimeHappened && isWithinTimeRunning) {
        return 'RUNNING'; // Time reached and within timeRunning
    } else if (diff > 0 && diff <= timeToPrepare) {
        return 'PREPARE'; // Future time within timeToPrepare
    } else if (diff < -timeRunning) {
        return 'COMPLETE'; // Time has passed beyond timeRunning
    } else {
        return 'WAITING'; // Beyond timeToPrepare
    }
};

// Update current window based on current time
const updateCurrentWindow = () => {
    if (!props.currentTime || props.excelData.length === 0) return;

    // Extract HH:MM from currentTime (HH:MM:SS)
    const timeParts = props.currentTime.split(':');
    const timeWithoutSeconds = `${timeParts[0]}:${timeParts[1]}`; // e.g., "18:19"

    // Find all active items (time reached and within timeRunning)
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