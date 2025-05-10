<template>
  <v-card color="transparent" variant="flat">
    <v-row no-gutters>
      <v-col cols="3" class="d-flex justify-center align-center">
        <TimeComponent :time="time" />
      </v-col>
      <v-col cols="3" class="d-flex justify-center align-center">
        <DestinationComponent :destination="destination" />
      </v-col>
      <v-col cols="2" class="d-flex justify-center align-center">
        <GateComponent :gate="gate" />
      </v-col>
      <v-col cols="4" class="d-flex justify-center align-center">
        <StatusComponent :status="status" />
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup>
import DestinationComponent from './items/DestinationComponent.vue';
import GateComponent from './items/GateComponent.vue';
import StatusComponent from './items/StatusComponent.vue';
import TimeComponent from './items/TimeComponent.vue';

defineProps({
  time: {
    type: String,
    required: true,
  },
  destination: {
    type: String,
    required: true,
  },
  gate: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
});
</script>