<template>
  <v-sheet class="border-lg d-inline-flex pa-1" :class="special" rounded>
    {{ character }}
  </v-sheet>
</template>

<script setup>
defineProps({
  character: String,
  special: String
});
</script>