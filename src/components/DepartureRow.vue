<template>
    <v-row no-gutters>
      <v-col cols="3" class="d-flex justify-center align-center">
        <TimeComponent :time="time" />
      </v-col>
      <v-col cols="3" class="d-flex justify-center align-center">
        <LotNumber :lotNumber="lotNumber" />
      </v-col>
      <v-col cols="3" class="d-flex justify-center align-center ma-n10">
        <CameraComponent :camera="camera" />
      </v-col>
      <v-col cols="3" class="d-flex justify-center align-center">
        <StatusComponent :status="status" />
      </v-col>
    </v-row>
</template>

<script setup>
import LotNumber from './items/LotNumber.vue';
import CameraComponent from './items/CameraComponent.vue';
import StatusComponent from './items/StatusComponent.vue';
import TimeComponent from './items/TimeComponent.vue';

defineProps({
  time: {
    type: String,
    required: true,
  },
  lotNumber: {
    type: String,
    required: true,
  },
  camera: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
});
</script>