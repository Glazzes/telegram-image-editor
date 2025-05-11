import { useCustomDimensions } from "@commons/hooks/useCustomsDimensions";
import { theme } from "@commons/theme";

const GRID_WIDTH_CONUT = 12;

export function useColorPickerDimensions() {
  const { width } = useCustomDimensions();
  const cellSize = (width - theme.spacing.m * 2) / GRID_WIDTH_CONUT;

  return {
    width: cellSize * GRID_WIDTH_CONUT,
    height: cellSize * 10,
    cellCount: GRID_WIDTH_CONUT,
    cellSize: cellSize,
    indicatorSize: cellSize * 1.2,
  };
}
