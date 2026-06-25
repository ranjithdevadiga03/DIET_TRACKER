/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'fade-in-up': 'fadeInUp 0.5s ease-out',
        'fade-in-down': 'fadeInDown 0.4s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'bounce-in': 'bounceIn 0.5s cubic-bezier(0.68,-0.55,0.27,1.55)',
        'float': 'float 4s ease-in-out infinite',
        'spin-slow': 'spin 4s linear infinite',
        'spin-reverse': 'spinReverse 3s linear infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'ping-slow': 'ping 2.5s cubic-bezier(0,0,0.2,1) infinite',
        'shake': 'shake 0.4s ease-in-out',
        'shimmer': 'shimmer 2s linear infinite',
        'logo-spin': 'logoSpin 3s ease-in-out infinite',
        'logo-pulse': 'logoPulse 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { from:{opacity:0}, to:{opacity:1} },
        fadeInUp: { from:{opacity:0,transform:'translateY(20px)'}, to:{opacity:1,transform:'translateY(0)'} },
        fadeInDown: { from:{opacity:0,transform:'translateY(-16px)'}, to:{opacity:1,transform:'translateY(0)'} },
        scaleIn: { from:{opacity:0,transform:'scale(0.9)'}, to:{opacity:1,transform:'scale(1)'} },
        bounceIn: { '0%':{opacity:0,transform:'scale(0.3)'}, '50%':{transform:'scale(1.05)'}, '70%':{transform:'scale(0.9)'}, '100%':{opacity:1,transform:'scale(1)'} },
        float: { '0%,100%':{transform:'translateY(0)'}, '50%':{transform:'translateY(-8px)'} },
        spinReverse: { from:{transform:'rotate(360deg)'}, to:{transform:'rotate(0deg)'} },
        shake: { '0%,100%':{transform:'translateX(0)'}, '25%':{transform:'translateX(-4px)'}, '75%':{transform:'translateX(4px)'} },
        shimmer: { '0%':{backgroundPosition:'-200% 0'}, '100%':{backgroundPosition:'200% 0'} },
        logoSpin: { '0%':{transform:'rotate(0deg) scale(1)'}, '50%':{transform:'rotate(10deg) scale(1.1)'}, '100%':{transform:'rotate(0deg) scale(1)'} },
        logoPulse: { '0%,100%':{transform:'scale(1)',filter:'brightness(1)'}, '50%':{transform:'scale(1.15)',filter:'brightness(1.2)'} },
      },
    },
  },
  plugins: [],
}
