import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
  },
  defaults: {
    VBtn: {
      style: 'letter-spacing: 0.5px; font-weight: 600;',
    },
    VCard: {
      style: 'font-size: 17px;',
    },
    VCardTitle: {
      style: 'font-size: 24px; font-weight: 700; line-height: 1.3;',
    },
    VCardSubtitle: {
      style: 'font-size: 16px; line-height: 1.6;',
    },
    VTextField: {
      style: 'font-size: 16px;',
    },
    VSelect: {
      style: 'font-size: 16px;',
    },
    VChip: {
      style: 'font-weight: 600; letter-spacing: 0.3px;',
    },
    VListItem: {
      style: 'font-size: 16px;',
    },
    VListItemTitle: {
      style: 'font-size: 16px; font-weight: 500;',
    },
  },
  theme: {
    defaultTheme: 'dark',
    themes: {
      dark: {
        dark: true,
        colors: {
          background: '#030711',
          surface: '#1c1c1c',
          primary: '#646cff',
          'primary-darken-1': '#3700B3',
          secondary: '#27272a',
          error: '#cf6679',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FB8C00',

          // Game-specific colors
          genshin: '#f78d60',
          honkai: '#f75270',
          zenless: '#ffdbb6',

          // Custom colors
          accent: '#8b5cf6',
          muted: '#27272a',
          'muted-foreground': '#a1a1aa',
          card: 'rgba(17, 17, 17, 0.45)',
          'card-foreground': '#fafafa',
          border: 'rgba(255, 255, 255, 0.08)',
        }
      }
    },
  },
})

export default vuetify
export { vuetify }
