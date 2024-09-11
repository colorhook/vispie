import type { Config } from "tailwindcss";
import animate from 'tailwindcss-animate';

const config: Config = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  prefix: "",
  corePlugins: {
    preflight: false,
  },
  plugins: [
    animate
  ],
};
export default config;
