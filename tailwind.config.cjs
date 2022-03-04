module.exports = {
    darkMode: "class",
    content: ["./src/**/*.html"],
    theme: {
        screens: {
            "sm": "640px",
            "md": "768px",
            "lg": "1280px",
            "xl": "1536px",
        },
        fontFamily: {
            "body": "Helvetica Now Display, sans-serif",
        },
        fontSize: {
            h1: ["32px", "120%"],
            h1_md: ["38px", "120%"],
            h1_lg: ["48px", "120%"],
            h1_xl: ["58px", "120%"],

            h2: ["20px", "100%"],
            h2_md: ["22px", "100%"],
            h2_lg: ["26px", "100%"],
            h2_xl: ["32px", "100%"],

            h3: ["14px", "120%"],
            h3_md: ["18px", "120%"],
            h3_lg: ["20px", "120%"],
            h3_xl: ["26px", "120%"],

            p1: ["24px", "140%"],
            p1_md: ["26px", "140%"],
            p1_lg: ["36px", "140%"],
            p1_xl: ["40px", "140%"],

            p2: ["14px", "130%"],
            p2_md: ["18px", "130%"],
            p2_lg: ["20px", "130%"],
            p2_xl: ["26px", "130%"],
        },
        colors: {
            transparent: "transparent",
            current: "currentColor",
            black: "#050505",
            grey: "#bfbfbf",
            white: "#ffffff",
            red: "#EA1E1E",
        },
        borderWidth: {
            DEFAULT: "1px",
            "0": "0",
            "18": "18px",
        },
        extend: {
            spacing: {
                "2px": "2px",
                "4px": "4px",
                "6px": "6px",
                "8px": "8px",
                "10px": "10px",
                "12px": "12px",
                "14px": "14px",
                "16px": "16px",
                "18px": "18px",
                "20px": "20px",
                "24px": "24px",
                "40px": "40px",
                "60px": "60px",
                "80px": "80px",
            },
            backgroundImage: {
                "check": "url('img/svg/check.svg')"
            },
        },
    },
    plugins: [],
}
