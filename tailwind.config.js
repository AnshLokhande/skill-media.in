/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        customDark: '#181E27',
        animation: {
          rotateCube: 'rotateCube 2s infinite linear', // Define the animation name
        },
      },
      keyframes: {
        rotateCube: {
          '0%': {
            transform: 'rotateX(0deg) rotateY(0deg)', // Start with no rotation
          },
          '100%': {
            transform: 'rotateX(360deg) rotateY(360deg)', // Rotate fully by 360 degrees
          },
        },
      },
    },
  },
  plugins: [],
}

