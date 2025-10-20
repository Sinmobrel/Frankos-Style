import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { config } from './app/app.config.server';

// Asegúrate de que solo hay una configuración de servidor
const bootstrap = () => bootstrapApplication(App, config);

export default bootstrap;
