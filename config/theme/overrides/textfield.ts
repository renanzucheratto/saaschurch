import { BORDER_RADIUS } from "@/config/utils/contants";
import { Components, Theme } from "@mui/material";

export const textFieldOverrides: Components<Theme> = {
    MuiTextField: {
        defaultProps: {
            size: "small",
        },
        styleOverrides: {
            root: ({ theme }) => ({
                '.MuiInputBase-root:not(.MuiInputBase-multiline)': {
                    borderRadius: `${theme.spacing(BORDER_RADIUS.full)} !important`,
                },
                '.MuiInputBase-multiline': {
                    borderRadius: `${theme.spacing(BORDER_RADIUS.small)} !important`,
                }
            }),
        },
    },
};