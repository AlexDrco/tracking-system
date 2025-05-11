<template>
  <v-sheet class="d-flex justify-center align-center" color="transparent">
    <template v-if="status.toUpperCase() === 'IN PROCESS'">
      <v-sheet 
        v-for="(char, index) in status.toUpperCase().split('')"
        :key="'status-' + index"
        class="bd-character d-inline-flex text-h4 text-mono ma-1 blink-animation"
        rounded
        style="color: #00af3f; text-shadow: 0 0 10px rgba(0, 175, 63, 0.7);"
      >
        {{ char }}
      </v-sheet>
    </template>
    
    <template v-else-if="status.toUpperCase() === 'COMPLETE'">
      <v-sheet 
        v-for="(char, index) in status.toUpperCase().split('')"
        :key="'status-' + index"
        class="bd-character d-inline-flex text-h4 text-mono ma-1"
        rounded
        style="color: #00af3f; text-shadow: 0 0 10px rgba(0, 175, 63, 0.7);"
      >
        {{ char }}
      </v-sheet>
    </template>
    
    <template v-else-if="status.toUpperCase() === 'PENDING'">
      <v-sheet 
        v-for="(char, index) in status.toUpperCase().split('')"
        :key="'status-' + index"
        class="bd-character d-inline-flex text-h4 text-mono ma-1"
        rounded
        style="color: #ffc72c; text-shadow: 0 0 10px rgba(255, 199, 44, 0.7);"
      >
        {{ char }}
      </v-sheet>
    </template>
    
    <template v-else-if="status.toUpperCase() === 'CANCELLED'">
      <v-sheet 
        v-for="(char, index) in status.toUpperCase().split('')"
        :key="'status-' + index"
        class="bd-character d-inline-flex text-h4 text-mono ma-1"
        rounded
        style="color: #e31837; text-shadow: 0 0 10px rgba(227, 24, 55, 0.7);"
      >
        {{ char }}
      </v-sheet>
    </template>
    
    <template v-else>
      <v-sheet 
        v-for="(char, index) in status.toUpperCase().split('')"
        :key="'status-' + index"
        class="bd-character d-inline-flex text-h4 text-mono ma-1"
        rounded
      >
        {{ char }}
      </v-sheet>
    </template>
  </v-sheet>
</template>

<script setup>
import { defineProps } from 'vue';

defineProps({
  status: {
    type: String,
    required: true,
  },
});
</script>

<style scoped>
.blink-animation {
  animation: blink-status 2s infinite;
}

@keyframes blink-status {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}
</style>