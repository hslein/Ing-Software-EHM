import { getBrandsApi, getHighlightsApi, getMissionVisionApi } from '../api/catalog.api';
import type { Brand, Highlight, MissionVision } from '../types/catalog.types';

export const getBrandsQuery = (): Brand[] => getBrandsApi();

export const getHighlightsQuery = (): Highlight[] => getHighlightsApi();

export const getMissionVisionQuery = (): MissionVision => getMissionVisionApi();
