<template>
  <v-sheet class="bd-character d-inline-flex text-h4" rounded>
    {{ character }}
  </v-sheet>
</template>

<script setup>
defineProps({
  character: String,
});
</script>