import { createTheme } from "@mui/material/styles";

const darkTheme = createTheme({
        palette: {
            mode: "dark",
            background: {
                default: "#0D1117",
                paper: "#161B22",
            },
            primary: {
                main: "#58A6FF",
                dark: "#1F6FEB",
                contrastText: "#FFFFFF",
            },
            divider: "#30363D",
            text: {
                primary: "#C9D1D9",
                secondary: "#8B949E",
            },
            action: {
                hover: "#2C313A",
                selected: "#21262D",
            },
        },
        components: {
            MuiBox: {
                defaultProps: {
                    sx: { p: 0 },
                },
            },
            MuiCssBaseline: {
                styleOverrides: {
                    body: {
                        backgroundColor: '#0D1117',
                    },
                },
            },
        },
    })
;

export default darkTheme;
