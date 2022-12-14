export interface UpdateProductDto {
  id: number;
  name: string;
  sku: string;
  description: string;
  price: number;
  file: Express.Multer.File;
  category_id: number;
}
