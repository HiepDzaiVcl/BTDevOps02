import { useEffect, useState } from 'react';
import axiosClient from '@/apis/axiosClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDispatch } from 'react-redux';
import { addToCart } from '@/redux/reducers/cartSlice';
import { toast } from 'react-toastify';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/utils/FormatCurrency';
import { motion, AnimatePresence } from 'framer-motion';
import { CarTaxiFrontIcon } from 'lucide-react';

interface Menu {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  category: { id: number; name: string };
}

const MenuPage = () => {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedMenu, setSelectedMenu] = useState<number | null>(null);
  const [isLoadingMenus, setIsLoadingMenus] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchMenus = async () => {
      setIsLoadingMenus(true);
      try {
        const response = await axiosClient.get('/menus');
        setMenus(response.data);
        // Thiết lập menu đầu tiên làm mặc định
        if (response.data.length > 0) {
          setSelectedMenu(response.data[0].id);
        }
      } catch (error) {
        console.error('Failed to fetch menus:', error);
        toast.error('Failed to fetch menus', { theme: 'colored' });
      } finally {
        setIsLoadingMenus(false);
      }
    };
    fetchMenus();
  }, []);

  useEffect(() => {
    if (selectedMenu) {
      const fetchProducts = async () => {
        setIsLoadingProducts(true);
        try {
          const response = await axiosClient.get(`/products?categoryId=${selectedMenu}`);
          setProducts(response.data);
        } catch (error) {
          console.error('Failed to fetch products:', error);
          toast.error('Failed to fetch products', { theme: 'colored' });
        } finally {
          setIsLoadingProducts(false);
        }
      };
      fetchProducts();
    }
  }, [selectedMenu]);

  const handleAddToCart = (product: Product) => {
    dispatch(
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        description: product.description,
        imageUrl: product.imageUrl,
        menuId: product.category.id,
        quantity: 1,
      })
    );
    toast.success(`${product.name} added to cart!`, {
      theme: 'colored',
      icon: CarTaxiFrontIcon,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 py-12 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-extrabold text-center text-gray-800 mb-10 tracking-tight font-poppins"
      >
        Our Menu
      </motion.h2>

      {/* Menu Buttons */}
      <div className="flex flex-wrap justify-center gap-3 mb-12 max-w-5xl mx-auto">
        {isLoadingMenus ? (
          Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="w-32 h-12 rounded-full animate-pulse bg-gray-200" />
          ))
        ) : menus.length === 0 ? (
          <p className="text-gray-500 text-lg">No menus available.</p>
        ) : (
          menus.map((menu) => (
            <Button
              key={menu.id}
              onClick={() => setSelectedMenu(menu.id)}
              variant={selectedMenu === menu.id ? 'default' : 'outline'}
              className={`
                rounded-full px-6 py-3 font-medium text-base sm:text-lg transition-all duration-300
                ${selectedMenu === menu.id
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gradient-to-r hover:from-indigo-100 hover:to-purple-100 hover:border-indigo-400'}
                hover:shadow-md
              `}
            >
              {menu.name}
            </Button>
          ))
        )}
      </div>

      {/* Products Grid */}
      <AnimatePresence>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {isLoadingProducts ? (
            Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="shadow-lg rounded-2xl overflow-hidden">
                <Skeleton className="h-52 w-full rounded-t-2xl animate-pulse bg-gray-200" />
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mx-auto animate-pulse bg-gray-200" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2 animate-pulse bg-gray-200" />
                  <Skeleton className="h-4 w-1/2 mb-4 animate-pulse bg-gray-200" />
                  <Skeleton className="h-10 w-32 mx-auto animate-pulse bg-gray-200" />
                </CardContent>
              </Card>
            ))
          ) : products.length === 0 ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="col-span-full text-center text-gray-500 text-lg"
            >
              No products available for this menu.
            </motion.p>
          ) : (
            products.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="shadow-lg rounded-2xl overflow-hidden bg-white transition-all duration-300 hover:shadow-2xl hover:scale-105">
                  <CardHeader className="p-0">
                    <div className="relative h-52 w-full bg-gray-200 flex items-center justify-center overflow-hidden rounded-t-2xl">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                      />
                    </div>
                    <CardTitle className="text-xl font-semibold text-gray-800 text-center mt-4">
                      {product.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2 font-medium">
                      {product.description}
                    </p>
                    <p className="text-lg font-bold text-indigo-600 mb-4">
                      {formatCurrency(product.price)}
                    </p>
                    <Button
                      onClick={() => handleAddToCart(product)}
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg py-2 transition-all duration-300 shadow-md"
                    >
                      Add to Cart
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </AnimatePresence>
    </div>
  );
};

export default MenuPage;