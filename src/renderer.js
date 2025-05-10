import { createApp } from 'vue';
import App from './App.vue';
import 'vuetify/styles'; // Import Vuetify styles
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import '@mdi/font/css/materialdesignicons.css'; // Import Material Design Icons

// Create Vuetify instance
const vuetify = createVuetify({
  theme: {
    defaultTheme: 'light'
  },
  components,
  directives,
});

// Create and mount the Vue app
const app = createApp(App);
app.use(vuetify);
app.mount('#app');