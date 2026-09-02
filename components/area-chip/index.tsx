import { Chip, type ChipProps } from "@mui/material";
import { AreaBullet } from "@/components/area-bullet";
import type { AreaResumo } from "@/types/projeto.types";

interface Props extends Omit<ChipProps, "label" | "icon"> {
  area: AreaResumo;
}

/** Chip da área com a bolinha na cor cadastrada. */
export const AreaChip = ({ area, ...chipProps }: Props) => (
  <Chip
    size="small"
    variant="outlined"
    label={area.nome}
    icon={<AreaBullet cor={area.cor} size={8} sx={{ ml: 1 }} />}
    {...chipProps}
  />
);
