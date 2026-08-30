import { Card, CardContent, CardProps, Stack, Typography } from "@mui/material"
import { ReactNode } from "react"

interface Props extends Omit<CardProps, "title" | "variant"> {
  title?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
}

export const CardWithTitle = ({ title, actions, children, ...cardProps }: Props) => {
  return <Card {...cardProps} variant="withTitle">
    {title && <Stack gap={1} pb={1} px={1} flexDirection="row" justifyContent="space-between" alignItems="center">
      <Stack sx={{ minWidth: 0, flex: 1 }}>
        {typeof title === "string" ? <Typography variant="subtitle1" sx={{fontWeight: 600}}>{title}</Typography> : title}
      </Stack>
      {actions && <Stack flexShrink={0}>{actions}</Stack>}
    </Stack>}
    <CardContent>
      {children}
    </CardContent>
  </Card>
}