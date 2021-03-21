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
      const productIsInCart = cart.find(product => product.id === productId);

      const stock = await api.get(`stock/${productId}`)
      .then(response => response.data);

      if (stock.amount <= 0){
        toast.error('Quantidade solicitada fora de estoque');
        return;
      } else if (productIsInCart){

        updateProductAmount ({productId, amount: productIsInCart.amount + 1});

      } else {
        const product = await api.get(`products/${productId}`)
        .then(response => response.data);

        const newCart = [
          ...cart,
          {
            ...product,
            amount: 1
          }
        ]
        
        setCart(newCart);
        localStorage.setItem("@RocketShoes:cart", JSON.stringify(newCart));
      }
      
    } catch {
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = async (productId: number) => {
    try {

      const isInCart = cart.find(cart => cart.id === productId);
      
      if(isInCart){
        
        const filteredCart = cart.filter(cart => cart.id !== productId)
        setCart(filteredCart);
  
        localStorage.setItem("@RocketShoes:cart", JSON.stringify(filteredCart));

      } else {
        throw new Error();
      }

    } catch {

      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {

      if (amount <= 0) return;

      const stockAmount = await api.get(`stock/${productId}`).then(response => response.data.amount);

      if (amount > stockAmount){
        toast.error('Quantidade solicitada fora de estoque');
        return;
      }

      const newCart = cart.map(product => product.id === productId ? {
        ...product,
        amount: amount
      } : product );

      setCart(newCart);

      localStorage.setItem("@RocketShoes:cart", JSON.stringify(newCart));

    } catch {
      toast.error('Erro na alteração de quantidade do produto');
    }
  };

  // useEffect(() => {
  //   localStorage.setItem("@RocketShoes:cart", JSON.stringify(cart));
  // }, [cart])

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
