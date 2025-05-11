<template>
    <v-card class="takt-time-container" elevation="0">
        <!-- Turno actual, progreso y tiempo actual (combinados) -->
        <v-card class="shift-indicator mb-4" elevation="2">
            <v-card-title class="d-flex justify-space-between align-center">
                <div>
                    <span class="text-h4">{{ currentShiftName }}</span>
                    <span class="text-h6 ml-4">{{ currentShiftTime }}</span>
                </div>
                <div class="d-flex align-center">
                    <span class="text-h4 mr-4">{{ formattedCurrentTime }}</span>
                    <v-progress-circular
                        :model-value="intervalProgressPercent"
                        :size="40"
                        :width="3"
                        color="#FFC107"
                    >
                        <span class="text-caption">{{ intervalProgressPercent.toFixed(0) }}</span>
                    </v-progress-circular>
                </div>
            </v-card-title>
            <v-card-text>
                <div class="d-flex justify-space-between align-center mb-2">
                    <span class="text-h6">Progreso del turno: {{ shiftProgressPercent.toFixed(2) }}%</span>
                    <span class="text-h6">{{ completedJobsCount }}/{{ totalShiftJobs }} trabajos</span>
                    <span class="text-h6">Próximo: {{ nextJobTime }}</span>
                </div>
                <v-progress-linear 
                    :model-value="shiftProgressPercent" 
                    color="#FFC107" 
                    height="10"
                    rounded
                ></v-progress-linear>
            </v-card-text>
        </v-card>

        <!-- Visualización tipo odómetro -->
        <v-card class="odometer-display" elevation="3">
            <v-card-text class="pa-0">
                <transition-group name="odometer" tag="div" class="odometer-container">
                    <!-- Indicador del trabajo actual -->
                    <div class="current-job-indicator" key="indicator"></div>
                    <div 
                        v-for="job in visibleJobs" 
                        :key="job.time + job.gate" 
                        :class="['job-row pa-3 d-flex align-center', 
                                getJobRowClass(job),
                                isCurrentTimeRow(job) ? 'current-row' : '']">
                        <!-- Usar el mismo sistema de columnas que el encabezado -->
                        <div class="time-column text-h4 font-weight-bold" style="width: 25%">
                            <div class="d-flex justify-center">{{ job.time }}</div>
                        </div>
                        <div class="lot-column text-h4" style="width: 25%">
                            <div class="d-flex justify-center">
                                <template v-if="job.destination">
                                    {{ job.destination }}
                                </template>
                                <template v-else>
                                    <span class="text-disabled">Empty</span>
                                </template>
                            </div>
                        </div>
                        <div class="gate-column text-h4" style="width: 16.6%">
                            <div class="d-flex justify-center">{{ job.gate }}</div>
                        </div>
                        <div class="status-column" style="width: 33.4%">
                            <div class="d-flex justify-center">
                                <v-chip
                                    :color="getStatusColor(job.status)"
                                    :class="{'blink-animation': job.status === 'In Process'}"
                                    size="x-large"
                                >
                                    <span class="text-h4">{{ job.status }}</span>
                                </v-chip>
                            </div>
                        </div>
                    </div>
                </transition-group>
            </v-card-text>
        </v-card>
    </v-card>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';

// Takt time refresh interval in milliseconds
const refreshInterval = 8000; // 8 seconds for UI updates

// Definición de turnos
const shifts = {
    first: { name: "Primer Turno", startHour: 6, endHour: 14 },
    second: { name: "Segundo Turno", startHour: 14, endHour: 22 },
    third: { name: "Tercer Turno", startHour: 22, endHour: 6 }
};

// Generar horarios para cada turno (cada 30 minutos)
const generateShiftTimes = (startHour, endHour) => {
    const times = [];
    let currentHour = startHour;
    
    // Manejar el caso especial del tercer turno que cruza la medianoche
    const isCrossingMidnight = endHour < startHour;
    const hoursToGenerate = isCrossingMidnight ? (24 - startHour) + endHour : endHour - startHour;
    
    for (let i = 0; i < hoursToGenerate * 2; i++) { // *2 porque son intervalos de 30 minutos
        const hour = (currentHour + Math.floor(i / 2)) % 24;
        const minute = (i % 2) * 30;
        times.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
    }
    
    return times;
};

// Generar horarios para todos los turnos
const firstShiftTimes = generateShiftTimes(shifts.first.startHour, shifts.first.endHour);
const secondShiftTimes = generateShiftTimes(shifts.second.startHour, shifts.second.endHour);
const thirdShiftTimes = generateShiftTimes(shifts.third.startHour, shifts.third.endHour);

// Datos de ejemplo para los trabajos (reemplazar con datos reales después)
const generateJobs = () => {
    const allJobs = [];
    
    // Primer turno
    firstShiftTimes.forEach((time, index) => {
        // Alternar entre CWS-78 y CWS-79
        const gate = index % 2 === 0 ? "CWS-78" : "CWS-79";
        // Algunos espacios vacíos aleatorios
        const isEmpty = Math.random() < 0.2; // 20% de probabilidad de estar vacío
        
        allJobs.push({
            time,
            destination: isEmpty ? null : `${['26ML', '10.5ML', '3ML', '1ML'][Math.floor(Math.random() * 4)]}-${Math.floor(Math.random() * 10000000)}`,
            gate,
            status: "Pending" // El estado se actualizará dinámicamente
        });
    });
    
    // Segundo turno
    secondShiftTimes.forEach((time, index) => {
        const gate = index % 2 === 0 ? "CWS-78" : "CWS-79";
        const isEmpty = Math.random() < 0.2;
        
        allJobs.push({
            time,
            destination: isEmpty ? null : `${['26ML', '10.5ML', '3ML', '1ML'][Math.floor(Math.random() * 4)]}-${Math.floor(Math.random() * 10000000)}`,
            gate,
            status: "Pending"
        });
    });
    
    // Tercer turno
    thirdShiftTimes.forEach((time, index) => {
        const gate = index % 2 === 0 ? "CWS-78" : "CWS-79";
        const isEmpty = Math.random() < 0.2;
        
        allJobs.push({
            time,
            destination: isEmpty ? null : `${['26ML', '10.5ML', '3ML', '1ML'][Math.floor(Math.random() * 4)]}-${Math.floor(Math.random() * 10000000)}`,
            gate,
            status: "Pending"
        });
    });
    
    return allJobs;
};

// Generar trabajos
const allJobs = ref(generateJobs());

// Current time tracking
const currentTime = ref('');
const currentTimeHour = ref(0);
const currentTimeMinute = ref(0);
const formattedCurrentTime = ref('');

// Determinar el turno actual
const currentShift = computed(() => {
    const hour = currentTimeHour.value;
    
    if (hour >= shifts.first.startHour && hour < shifts.first.endHour) {
        return 'first';
    } else if (hour >= shifts.second.startHour && hour < shifts.second.endHour) {
        return 'second';
    } else {
        return 'third';
    }
});

// Nombre del turno actual
const currentShiftName = computed(() => {
    return shifts[currentShift.value].name;
});

// Horario del turno actual
const currentShiftTime = computed(() => {
    const shift = shifts[currentShift.value];
    return `${shift.startHour}:00 - ${shift.endHour}:00`;
});

// Trabajos del turno actual
const currentShiftJobs = computed(() => {
    const shift = currentShift.value;
    
    if (shift === 'first') {
        return allJobs.value.filter(job => {
            const hour = parseInt(job.time.split(':')[0], 10);
            return hour >= shifts.first.startHour && hour < shifts.first.endHour;
        });
    } else if (shift === 'second') {
        return allJobs.value.filter(job => {
            const hour = parseInt(job.time.split(':')[0], 10);
            return hour >= shifts.second.startHour && hour < shifts.second.endHour;
        });
    } else {
        return allJobs.value.filter(job => {
            const hour = parseInt(job.time.split(':')[0], 10);
            return hour >= shifts.third.startHour || hour < shifts.third.endHour;
        });
    }
});

// Total de trabajos en el turno actual
const totalShiftJobs = computed(() => {
    return currentShiftJobs.value.filter(job => job.destination !== null).length;
});

// Trabajos completados en el turno actual
const completedJobsCount = computed(() => {
    return currentShiftJobs.value.filter(job => job.status === 'Complete').length;
});

// Progreso del turno en porcentaje
const shiftProgressPercent = computed(() => {
    const shift = shifts[currentShift.value];
    const startHour = shift.startHour;
    const endHour = shift.endHour;
    
    // Duración total del turno en minutos
    const shiftDuration = endHour > startHour ? 
        (endHour - startHour) * 60 : 
        ((24 - startHour) + endHour) * 60;
    
    // Tiempo transcurrido desde el inicio del turno
    let elapsedTime;
    const currentHour = currentTimeHour.value;
    const currentMinute = currentTimeMinute.value;
    
    if (endHour > startHour) { // Turno normal
        elapsedTime = (currentHour - startHour) * 60 + currentMinute;
    } else { // Turno que cruza la medianoche
        if (currentHour >= startHour) {
            elapsedTime = (currentHour - startHour) * 60 + currentMinute;
        } else {
            elapsedTime = ((24 - startHour) + currentHour) * 60 + currentMinute;
        }
    }
    
    // Asegurar que el progreso esté entre 0 y 100
    return Math.min(100, Math.max(0, (elapsedTime / shiftDuration) * 100));
});

// Progreso del intervalo actual en porcentaje
const intervalProgressPercent = computed(() => {
    // Encontrar el trabajo actual
    const currentJob = allJobs.value.find(isCurrentTimeRow);
    if (!currentJob) return 0;
    
    const [jobHourStr, jobMinuteStr] = currentJob.time.split(':');
    const jobHour = parseInt(jobHourStr, 10);
    const jobMinute = parseInt(jobMinuteStr, 10);
    
    // Convertir a minutos para facilitar la comparación
    const jobTimeInMinutes = (jobHour * 60) + jobMinute;
    const currentTimeInMinutes = (currentTimeHour.value * 60) + currentTimeMinute.value;
    
    // Calcular cuántos minutos han pasado desde el inicio del intervalo
    let elapsedMinutes = (currentTimeInMinutes - jobTimeInMinutes);
    if (elapsedMinutes < 0) elapsedMinutes += 24 * 60; // Ajustar para cruces de día
    
    // El intervalo es de 30 minutos
    return Math.min(100, Math.max(0, (elapsedMinutes / 30) * 100));
});

// Hora del próximo trabajo
const nextJobTime = computed(() => {
    // Encontrar el trabajo actual
    const currentJobIndex = allJobs.value.findIndex(isCurrentTimeRow);
    if (currentJobIndex === -1) return "--:--";
    
    // Buscar el siguiente trabajo no vacío
    for (let i = currentJobIndex + 1; i < allJobs.value.length; i++) {
        if (allJobs.value[i].destination) {
            return allJobs.value[i].time;
        }
    }
    
    // Si no hay más trabajos, volver al primero (ciclo)
    for (let i = 0; i < currentJobIndex; i++) {
        if (allJobs.value[i].destination) {
            return allJobs.value[i].time;
        }
    }
    
    return "--:--";
});

// Trabajos visibles (2 anteriores, 2 en proceso, 2 siguientes)
const visibleJobs = computed(() => {
    // Encontrar todos los trabajos actuales (puede haber más de uno en el rango de 30 minutos)
    const currentJobs = allJobs.value.filter(isCurrentTimeRow);
    
    // Si no hay trabajo actual, mostrar los primeros 6 trabajos
    if (currentJobs.length === 0) {
        return allJobs.value.slice(0, 6);
    }
    
    // Usar el primer trabajo actual como referencia
    const currentJobIndex = allJobs.value.indexOf(currentJobs[0]);
    
    // Calcular los índices para mostrar 2 trabajos anteriores (completados)
    const pastJobs = [];
    for (let i = currentJobIndex - 1; i >= 0 && pastJobs.length < 2; i--) {
        pastJobs.unshift(allJobs.value[i]);
    }
    
    // Obtener todos los trabajos actuales (en proceso)
    // Limitamos a 2 trabajos en proceso como máximo
    const processJobs = currentJobs.slice(0, 2);
    
    // Calcular los índices para mostrar 2 trabajos siguientes (pendientes)
    const futureJobs = [];
    for (let i = currentJobIndex + currentJobs.length; i < allJobs.value.length && futureJobs.length < 2; i++) {
        if (allJobs.value[i].destination) {
            futureJobs.push(allJobs.value[i]);
        }
    }
    
    // Combinar todos los trabajos
    const result = [...pastJobs, ...processJobs, ...futureJobs];
    
    // Si no tenemos 6 trabajos en total, completamos con más trabajos anteriores o futuros
    if (result.length < 6) {
        // Primero intentamos añadir más trabajos futuros
        if (futureJobs.length < 2) {
            const remainingFutureCount = 2 - futureJobs.length;
            const lastIndex = allJobs.value.indexOf(result[result.length - 1]);
            
            for (let i = lastIndex + 1; i < allJobs.value.length && futureJobs.length < 2; i++) {
                result.push(allJobs.value[i]);
            }
        }
        
        // Si aún necesitamos más trabajos, añadimos trabajos anteriores
        if (result.length < 6 && pastJobs.length < 2) {
            const firstIndex = pastJobs.length > 0 ? allJobs.value.indexOf(pastJobs[0]) : currentJobIndex;
            
            if (firstIndex > 0) {
                const extraPastJobs = allJobs.value.slice(Math.max(0, firstIndex - (6 - result.length)), firstIndex);
                result.unshift(...extraPastJobs);
            }
        }
    }
    
    // Limitar a 6 trabajos en total
    return result.slice(0, 6);
});

// Actualizar el estado de los trabajos según la hora actual
const updateJobStatuses = () => {
    const currentTimeInMinutes = (currentTimeHour.value * 60) + currentTimeMinute.value;
    
    allJobs.value.forEach(job => {
        if (!job.destination) {
            job.status = "Empty";
            return;
        }
        
        const [hourStr, minuteStr] = job.time.split(':');
        const hour = parseInt(hourStr, 10);
        const minute = parseInt(minuteStr, 10);
        const jobTimeInMinutes = (hour * 60) + minute;
        
        // Determinar si el trabajo es pasado, actual o futuro
        if (Math.abs(jobTimeInMinutes - currentTimeInMinutes) <= 30) {
            job.status = "In Process";
        } else if (jobTimeInMinutes < currentTimeInMinutes) {
            // Manejar el caso especial de cruce de día
            if (currentTimeInMinutes - jobTimeInMinutes > 12 * 60) {
                job.status = "Pending";
            } else {
                job.status = "Complete";
            }
        } else {
            // Manejar el caso especial de cruce de día
            if (jobTimeInMinutes - currentTimeInMinutes > 12 * 60) {
                job.status = "Complete";
            } else {
                job.status = "Pending";
            }
        }
    });
};

// Verificar si un trabajo corresponde a la hora actual
const isCurrentTimeRow = (job) => {
    if (!job || !job.time) return false;
    
    const [hourStr, minuteStr] = job.time.split(':');
    const hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);
    
    // Convertir a minutos para facilitar la comparación
    const jobTimeInMinutes = (hour * 60) + minute;
    const currentTimeInMinutes = (currentTimeHour.value * 60) + currentTimeMinute.value;
    
    // Considerar el trabajo como actual si está dentro de un rango de 30 minutos
    return Math.abs(jobTimeInMinutes - currentTimeInMinutes) <= 30;
};

// Obtener la clase CSS para una fila de trabajo
const getJobRowClass = (job) => {
    if (!job.destination) return 'empty-job';
    
    switch (job.status) {
        case 'Complete': return 'completed-job';
        case 'In Process': return 'current-job';
        case 'Pending': return 'pending-job';
        default: return '';
    }
};

// Obtener el color para un estado
const getStatusColor = (status) => {
    switch (status) {
        case 'Complete': return 'success';
        case 'In Process': return 'warning'; // Cambiado a amarillo
        case 'Pending': return 'warning';
        case 'Cancelled': return 'error';
        case 'Empty': return 'grey';
        default: return 'grey';
    }
};

// Actualizar la hora actual
const updateCurrentTime = () => {
    const now = new Date();
    currentTime.value = now.toLocaleTimeString('en-US', { hour12: false });
    currentTimeHour.value = now.getHours();
    currentTimeMinute.value = now.getMinutes();
    formattedCurrentTime.value = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    // Actualizar el estado de los trabajos
    updateJobStatuses();
};

// Referencias de temporizadores para limpieza
let updateTimer = null;

onMounted(() => {
    // Actualización inicial
    updateCurrentTime();
    
    // Configurar actualizaciones periódicas
    updateTimer = setInterval(updateCurrentTime, 60000); // Actualizar cada minuto
});

onBeforeUnmount(() => {
    // Limpiar temporizadores
    if (updateTimer) clearInterval(updateTimer);
});

// Exponer valores para componentes padres
defineExpose({
    refreshInterval
});
</script>

<style scoped>
.takt-time-container {
    background-color: transparent;
}

.shift-indicator, .time-indicator, .odometer-display {
    background-color: rgba(26, 26, 26, 0.7) !important;
    border: 1px solid var(--bd-accent) !important;
    border-radius: 8px !important;
}

.odometer-display {
    height: 700px; /* Aumentar altura para mostrar 6 trabajos con texto más grande */
    position: relative;
    overflow: hidden;
}

.odometer-container {
    position: relative;
    height: 660px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    padding: 0 10px;
}

.job-row {
    border-left: 4px solid transparent;
    transition: all 0.3s ease;
    padding: 20px 10px !important; /* Aumentar padding vertical */
    margin-bottom: 10px;
    width: 95% !important; /* Reducir ligeramente el ancho */
    max-width: 95% !important;
    box-sizing: border-box;
}

.current-job {
    background: linear-gradient(90deg, rgba(255, 193, 7, 0.05) 0%, rgba(255, 193, 7, 0.2) 50%, rgba(255, 193, 7, 0.05) 100%) !important;
}

.current-row {
    border-left: 6px solid #FFC107 !important; /* Color amarillo, borde más grueso */
    box-shadow: 0 0 20px rgba(255, 193, 7, 0.4) !important; /* Sombra amarilla más intensa */
    position: relative;
    z-index: 10;
    transform: scale(1.03); /* Reducir el escalado para evitar que se salga */
    background-color: rgba(255, 193, 7, 0.15) !important; /* Fondo amarillo */
    margin: 12px 0 !important; /* Más margen vertical */
    max-width: 97% !important; /* Limitar el ancho para evitar desbordamiento */
}

.completed-job {
    opacity: 0.8;
}

.empty-job {
    opacity: 0.6;
}

/* Indicador visual de la posición actual */
.current-job-indicator {
    position: absolute;
    left: 2.5%;
    width: 95%;
    top: 50%;
    height: 110px; /* Aumentar altura para coincidir con el nuevo tamaño de texto */
    transform: translateY(-50%);
    background: linear-gradient(90deg, 
        rgba(255, 193, 7, 0.05) 0%, 
        rgba(255, 193, 7, 0.1) 50%, 
        rgba(255, 193, 7, 0.05) 100%);
    border-left: 4px solid #FFC107;
    border-right: 4px solid #FFC107;
    z-index: 5;
    pointer-events: none;
    box-sizing: border-box;
}

/* Animaciones del odómetro */
.odometer-enter-active,
.odometer-leave-active {
    transition: all 0.5s ease;
}

.odometer-enter-from {
    transform: translateY(100%);
    opacity: 0;
}

.odometer-leave-to {
    transform: translateY(-100%);
    opacity: 0;
}

.blink-animation {
    animation: blink-status 2s infinite;
}

@keyframes blink-status {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
}
</style>