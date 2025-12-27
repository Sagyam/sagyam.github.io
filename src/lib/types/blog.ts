export interface BlogPost {
  id: string;
  title: string;
  summary: string;
  link: string;
  publication: string;
  imageId: string;
  imageUrl?: string;
  tech?: string[];
}
