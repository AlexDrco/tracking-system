<template>
    <v-app>
        <v-app-bar>
            <v-app-bar-title class="text-h2 font-weight-bold text-center text-secondary">BATCH TRACKER</v-app-bar-title>
        </v-app-bar>
        <v-main>
            <v-container fluid class="pa-0 h-100">
                <DepartureRow time="TIME" destination="BATCH" gate="CAM" status="STATUS" />
                <v-divider thickness="5" class="my-5"></v-divider>


                <CarousselComponent></CarousselComponent>
            </v-container>
        </v-main>
    </v-app>
</template>

<script setup>
import CarousselComponent from './components/CarousselComponent.vue';
import DepartureRow from './components/DepartureRow.vue';


</script>