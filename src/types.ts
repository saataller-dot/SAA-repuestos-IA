export interface SparePart {
  codigo: string;
  descripcion: string;
  fotos: string;
  marca: string;
  precio: number;
  stock?: number;
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  parts?: SparePart[];
}
