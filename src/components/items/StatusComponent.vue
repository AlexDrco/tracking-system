<template>
  <v-sheet class="d-flex justify-center align-center" color="transparent">
    <CharacterSheet v-for="(char, index) in status.toUpperCase().split('')" :key="'status-' + index" :character="char"
      class="text-mono ma-1" :class="statusClass(status)" special="text-h3" />
  </v-sheet>
</template>

<script setup>
import CharacterSheet from './CharacterSheet.vue';

defineProps({
  status: {
    type: String,
    required: true,
  },
});

const statusClass = (status) => {
  const upperStatus = status.toUpperCase();
  if (upperStatus === 'COMPLETE') return 'text-cyan';
  if (upperStatus === 'RUNNING') return 'text-green';
  if (upperStatus === 'PREPARE') return 'text-orange';
  if (upperStatus === 'WAITING') return 'text-red';
  return 'text-cyan'; // Default
};
</script>