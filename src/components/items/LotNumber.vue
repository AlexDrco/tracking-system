<template>
  <v-sheet class="d-flex justify-center align-center" color="transparent">
    <CharacterSheet
      v-for="(char, index) in lotNumber.split('').map(c => (/[a-zA-Z]/.test(c) ? c.toUpperCase() : c))"
      :key="'dest-' + index"
      :character="char"
      class="text-mono text-cyan ma-1"
      special="text-h2"
    />
  </v-sheet>
</template>

<script setup>
import CharacterSheet from './CharacterSheet.vue';

defineProps({
  lotNumber: {
    type: String,
    required: true,
  },
});
</script>