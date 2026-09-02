import { Box, type SxProps, type Theme } from "@mui/material";
import type { AreaResumo } from "@/types/projeto.types";

interface Props {
  cor: AreaResumo["cor"];
  size?: number;
  sx?: SxProps<Theme>;
}

/** Bolinha na cor cadastrada da área. */
export const AreaBullet = ({ cor, size = 10, sx }: Props) => (
  <Box
    component="span"
    sx={{
      width: size,
      height: size,
      borderRadius: "50%",
      flexShrink: 0,
      bgcolor: cor || "grey.400",
      ...sx,
    }}
  />
);
