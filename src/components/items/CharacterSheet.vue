<template>
  <v-sheet class="border-lg d-inline-flex pa-3 text-h2" rounded>
    {{ character }}
  </v-sheet>
</template>

<script setup>
defineProps({
  character: String,
});
</script>