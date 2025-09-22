export interface Product {
  _id?: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  stock: number;
  createdAt?: Date;
  updatedAt?: Date;
}
