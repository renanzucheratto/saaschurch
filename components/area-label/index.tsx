import { Stack, Typography } from "@mui/material";
import { AreaBullet } from "@/components/area-bullet";
import type { AreaResumo } from "@/types/projeto.types";

interface Props {
  area: AreaResumo;
}

/** Área sem moldura: apenas a bolinha colorida e o nome. */
export const AreaLabel = ({ area }: Props) => (
  <Stack direction="row" alignItems="center" gap={0.75}>
    <AreaBullet cor={area.cor} size={8} />
    <Typography variant="body2" sx={{ fontWeight: 600 }}>
      {area.nome}
    </Typography>
  </Stack>
);
