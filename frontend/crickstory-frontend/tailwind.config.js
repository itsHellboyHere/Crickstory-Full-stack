/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'media', // required for manual theme switching
    content: [
        './app/**/*.{js,ts,jsx,tsx}',
        './components/**/*.{js,ts,jsx,tsx}',
        './pages/**/*.{js,ts,jsx,tsx}',     // ✅ if using /pages too
        './public/**/*.{js,ts,jsx,tsx}',    // ✅ optional, if any js in /public
    ],
    theme: {
        extend: {
            // you can customize colors here later
        },
    },
    plugins: [],
}
