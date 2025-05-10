<template>
  <v-sheet class="d-flex justify-center align-center" color="transparent">
    <CharacterSheet
      v-for="(char, index) in time.split('')"
      :key="'time-' + index"
      :character="char"
      class="text-mono text-cyan ma-1"
    />
  </v-sheet>
</template>

<script setup>
import CharacterSheet from './CharacterSheet.vue';

defineProps({
  time: {
    type: String,
    required: true,
  },
});
</script>