export interface TechnologyCategory {
  technology_category_id: string;
  name: string;
}

export interface Technology {
  technology_id: string;
  name: string;
  categories: TechnologyCategory[];
}
