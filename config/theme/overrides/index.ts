import { buttonOverrides } from "./button-overrides";
import { dataGridOverrides } from "./datagrid-overrides";
import { cardOverrides } from "./card-overrides";
import { textFieldOverrides } from "./textfield";
import { appBarOverrides } from "./appbar-overrides";
import { drawerOverrides } from "./drawer-overrides";

export const components = {
  ...buttonOverrides,
  ...dataGridOverrides,
  ...cardOverrides,
  ...textFieldOverrides,
  ...appBarOverrides,
  ...drawerOverrides,
};