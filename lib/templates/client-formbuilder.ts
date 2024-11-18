import { createApp } from 'vue';
import App from './app.vue';
import Vueform from '@vueform/vueform';
import MaskPlugin from '@vueform/plugin-mask';
import { createI18n } from 'vue-i18n'
import vueformConfig from '../vueform.config';

const i18n = createI18n({
    silentTranslationWarn: true, 
    silentFallbackWarn: true,   
    missingWarn: false,        
    fallbackWarn: false,
});

const app = createApp(App);
app.use(i18n);
app.use(Vueform, vueformConfig);
app.use(MaskPlugin);
app.mount('#app');
