import { buttonOverrides } from "./button-overrides";
import { dataGridOverrides } from "./datagrid-overrides";
import { cardOverrides } from "./card-overrides";
import { textFieldOverrides } from "./textfield";

export const components = {
  ...buttonOverrides,
  ...dataGridOverrides,
  ...cardOverrides,
  ...textFieldOverrides,
};