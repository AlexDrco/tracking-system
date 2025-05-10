<template>
  <v-sheet class="d-flex justify-center align-center" color="transparent">
    <CharacterSheet
      v-for="(char, index) in camera.toUpperCase().split('')"
      :key="'gate-' + index"
      :character="char"
      class="text-mono text-cyan ma-1"
    />
  </v-sheet>
</template>

<script setup>
import CharacterSheet from './CharacterSheet.vue';

defineProps({
  camera: {
    type: String,
    required: true,
  },
});
</script>