import { brands, highlights, missionVision } from '../constants/catalog.constants';
import type { Brand, Highlight, MissionVision } from '../types/catalog.types';

export const getBrandsApi = (): Brand[] => brands;

export const getHighlightsApi = (): Highlight[] => highlights;

export const getMissionVisionApi = (): MissionVision => missionVision;
