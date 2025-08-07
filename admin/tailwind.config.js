/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      boxShadow: {
        'press': 'inset 0 -3px 0 0 rgb(34 41 47 / 20%)',
        'primary': 'inset 0 -2px 0 0 #001C30',
        'left-primary': 'inset 2px 0px 0 0 #001C30',
        'secondary': 'inset 0 -2px 0 0 #d61e5c',
        'left-secondary': 'inset 2px 0px 0 0 #d61e5c',
        'secondary': 'inset 0 -2px 0 0 #001126',
        default: '0 2px 10px 0 rgb(94 86 105 / 10%)',
        bottom: '0px 2px 0px #b4b2af'
      },
      colors: {
        font: "#484848",
        default: "#f3f1f1",
        primary: "#001C30",
        primaryLight: "#001C30",
        primaryDark: "#001C30",
        secondary: "#d61e5c",
        dark: "#1d1d1d",
        "dark-page": "#121212",
        positive: "#28a745",
        negative: "#34B1AA",
        info: "#8D8D8D",
        warning: "#E0B50F",
        borderDefault: "#e1dfdf",
      },
      fontSize: {
        xxs: "10px",
        xxxs: "9px",
      },
    },
  },
  plugins: [],
}

