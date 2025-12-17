import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                primary: {
                    DEFAULT: "#6200EE", // Material Deep Purple 500
                    light: "#9c27b0",
                    dark: "#3700B3",
                },
                secondary: {
                    DEFAULT: "#03DAC6", // Material Teal 200
                    dark: "#018786",
                },
                surface: "#FFFFFF",
                error: "#B00020",
                gray: {
                    50: "#FAFAFA",
                    100: "#F5F5F5",
                    200: "#EEEEEE",
                    300: "#E0E0E0",
                    400: "#BDBDBD",
                    500: "#9E9E9E",
                    600: "#757575",
                    700: "#616161",
                    800: "#424242",
                    900: "#212121",
                }
            },
            boxShadow: {
                'elevation-1': '0 2px 1px -1px rgba(0,0,0,0.2), 0 1px 1px 0 rgba(0,0,0,0.14), 0 1px 3px 0 rgba(0,0,0,0.12)',
                'elevation-2': '0 3px 1px -2px rgba(0,0,0,0.2), 0 2px 2px 0 rgba(0,0,0,0.14), 0 1px 5px 0 rgba(0,0,0,0.12)',
                'elevation-3': '0 3px 3px -2px rgba(0,0,0,0.2), 0 3px 4px 0 rgba(0,0,0,0.14), 0 1px 8px 0 rgba(0,0,0,0.12)',
                'elevation-4': '0 2px 4px -1px rgba(0,0,0,0.2), 0 4px 5px 0 rgba(0,0,0,0.14), 0 1px 10px 0 rgba(0,0,0,0.12)',
                'elevation-8': '0 5px 5px -3px rgba(0,0,0,0.2), 0 8px 10px 1px rgba(0,0,0,0.14), 0 3px 14px 2px rgba(0,0,0,0.12)',
            },
            borderRadius: {
                'xl': '1rem',
                '2xl': '1.5rem',
            },
            fontFamily: {
                sans: ['"Inter"', '"Roboto"', 'sans-serif'],
            }
        },
    },
    plugins: [],
};
export default config;
