@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Inter:wght@300;400;500;600&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Great+Vibes&family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap');
@import "tailwindcss";

@theme {
  --color-forest: #243119;
  --color-cream: #F5F2ED;
  --color-brand-green-light: #B7BAA2;
  --font-serif: "Playfair Display", "Cormorant Garamond", serif;
  --font-sans: "Inter", sans-serif;
}

@layer base {
  body {
    @apply bg-cream text-forest font-sans antialiased selection:bg-forest selection:text-cream;
  }
}

/* Smooth scroll behavior */
html {
  scroll-behavior: smooth;
}

/* Ensure ultra-sharp image rendering and prevent blur/smoothing filters on scale */
img {
  image-rendering: -webkit-optimize-contrast !important;
  image-rendering: crisp-edges !important;
  image-rendering: pixelated; /* Fallback for browsers supporting pixelated style for sharpness */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Hide scrollbar but keep functionality */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* Parallax Utilities */
.parallax-bg {
  background-attachment: fixed;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
}

/* Smooth SVG transition effects for logo and texts */
.transition-svg,
.transition-svg * {
  transition: fill 1000ms cubic-bezier(0.4, 0, 0.2, 1), 
              stroke 1000ms cubic-bezier(0.4, 0, 0.2, 1), 
              opacity 1000ms cubic-bezier(0.4, 0, 0.2, 1), 
              stroke-opacity 1000ms cubic-bezier(0.4, 0, 0.2, 1),
              color 1000ms cubic-bezier(0.4, 0, 0.2, 1);
}

