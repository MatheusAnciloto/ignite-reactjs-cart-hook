import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart');
    console.log('storagedCart', storagedCart);

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      const stock = await api.get<Stock>(`stock/${productId}`)
      .then(response => response.data);

      if (stock.amount <= 0){
        toast.error('Quantidade solicitada fora de estoque');
        return;
      } else if (cart.find(product => product.id === productId)){
        console.log('cai no else if');
        //updateProductAmount(productId, 1);
      } else {
        const product = await api.get(`products/${productId}`)
        .then(response => response.data);

        await api.put(`stock/${productId}`, {
          amount: stock.amount - 1
        });
        
        setCart([...cart, {
          id: product.id,
          title: product.title,
          price: product.price,
          image: product.image,
          amount: 1
        }]);
      }
      
      
    } catch {
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  };

  useEffect(() => {
    console.log('cart', cart);
    localStorage.setItem("@RocketShoes:cart", JSON.stringify(cart));
  }, [cart])

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}



export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
