import { useEffect, useState } from "react";
import axiosClient from "@/apis/axiosClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "react-toastify";
import { formatCurrency } from "@/utils/FormatCurrency";

interface Menu {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  category: Menu;
  imageUrl?: string;
}

const ProductManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: 0,
    description: "",
    categoryId: 0,
  });
  const [newProductImage, setNewProductImage] = useState<File | null>(null);
  const [newProductImagePreview, setNewProductImagePreview] = useState<string | null>(null);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [editProductImage, setEditProductImage] = useState<File | null>(null);
  const [editProductImagePreview, setEditProductImagePreview] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchProducts = async () => {
    try {
      const response = await axiosClient.get("/products");
      setProducts(response.data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      toast.error("Failed to fetch products");
    }
  };

  const fetchMenus = async () => {
    try {
      const response = await axiosClient.get("/menus");
      setMenus(response.data);
    } catch (error) {
      console.error("Failed to fetch menus:", error);
      toast.error("Failed to fetch menus");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      if (isEdit) {
        setEditProductImage(file);
        setEditProductImagePreview(previewUrl);
      } else {
        setNewProductImage(file);
        setNewProductImagePreview(previewUrl);
      }
    }
  };

  const handleCreateProduct = async () => {
    // Validate inputs
    if (newProduct.categoryId === 0) {
      toast.error("Please select a menu category");
      return;
    }
    if (!newProduct.name || newProduct.price <= 0) {
      toast.error("Please provide a valid name and price");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("product", JSON.stringify({
        name: newProduct.name,
        price: newProduct.price,
        description: newProduct.description,
      }));
      formData.append("categoryId", newProduct.categoryId.toString());
      if (newProductImage) {
        formData.append("imageFile", newProductImage);
      }

      const response = await axiosClient.post("/products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProducts([...products, response.data]);
      setNewProduct({ name: "", price: 0, description: "", categoryId: 0 });
      setNewProductImage(null);
      setNewProductImagePreview(null);
      toast.success("Product created successfully");
    } catch (error) {
      console.error("Failed to create product:", error);
      toast.error("Failed to create product");
    }
  };

  const handleUpdateProduct = async () => {
    if (!editProduct) return;
    if (editProduct.category.id === 0) {
      toast.error("Please select a menu category");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("product", JSON.stringify({
        name: editProduct.name,
        price: editProduct.price,
        description: editProduct.description,
      }));
      formData.append("categoryId", editProduct.category.id.toString());
      if (editProductImage) {
        formData.append("imageFile", editProductImage);
      }

      const response = await axiosClient.put(`/products/${editProduct.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProducts(
        products.map((product) =>
          product.id === editProduct.id ? response.data : product
        )
      );
      setEditProduct(null);
      setEditProductImage(null);
      setEditProductImagePreview(null);
      setIsDialogOpen(false);
      toast.success("Product updated successfully");
    } catch (error) {
      console.error("Failed to update product:", error);
      toast.error("Failed to update product");
    }
  };

  const handleDeleteProduct = async (id: number) => {
    try {
      await axiosClient.delete(`/products/${id}`);
      setProducts(products.filter((product) => product.id !== id));
      toast.success("Product deleted successfully");
    } catch (error) {
      console.error("Failed to delete product:", error);
      toast.error("Failed to delete product");
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchMenus();
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Product Management</h2>
      <div className="mb-6 p-6 bg-white rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4 text-gray-700">Add New Product</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600">Product Name</label>
            <Input
              placeholder="Product name"
              value={newProduct.name}
              onChange={(e) =>
                setNewProduct({ ...newProduct, name: e.target.value })
              }
              className="border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600">Price</label>
            <Input
              type="number"
              placeholder="Price"
              value={newProduct.price}
              onChange={(e) =>
                setNewProduct({ ...newProduct, price: Number(e.target.value) })
              }
              className="border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600">Description</label>
            <Input
              placeholder="Description"
              value={newProduct.description}
              onChange={(e) =>
                setNewProduct({ ...newProduct, description: e.target.value })
              }
              className="border-gray-30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600">Select Menu</label>
            <Select
              onValueChange={(value) =>
                setNewProduct({ ...newProduct, categoryId: Number(value) })
              }
            >
              <SelectTrigger className="border-gray-300">
                <SelectValue placeholder="Select menu" />
              </SelectTrigger>
              <SelectContent>
                {menus.map((menu) => (
                  <SelectItem key={menu.id} value={menu.id.toString()}>
                    {menu.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600">Product Image</label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageChange(e, false)}
              className="border-gray-300 "
            />
            
          </div>
          {newProductImagePreview && (
              <div className="mt-2 mx-auto">
                <img
                  src={newProductImagePreview}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-lg shadow-sm"
                />
              </div>
            )}
        </div>
        <Button
          onClick={handleCreateProduct}
          className="mt-4  text-white"
        >
          Create Product
        </Button>
      </div>
      <Table className="bg-white rounded-lg shadow-md">
        <TableHeader>
          <TableRow>
            <TableHead className="text-gray-600">ID</TableHead>
            <TableHead className="text-gray-600">Image</TableHead>
            <TableHead className="text-gray-600">Name</TableHead>
            <TableHead className="text-gray-600">Price</TableHead>
            <TableHead className="text-gray-600">Description</TableHead>
            <TableHead className="text-gray-600">Menu</TableHead>
            <TableHead className="text-gray-600">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product, index) => (
            <TableRow key={product.id}>
              <TableCell>{index+1}</TableCell>
              <TableCell>
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                ) : (
                  <span>No Image</span>
                )}
              </TableCell>
              <TableCell>{product.name}</TableCell>
              <TableCell>{formatCurrency(product.price)}</TableCell>
              <TableCell>{product.description}</TableCell>
              <TableCell>{product.category.name}</TableCell>
              <TableCell>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="mr-2  hover:bg-indigo-50"
                      onClick={() => {
                        setEditProduct(product);
                        setEditProductImagePreview(product.imageUrl || null);
                        setIsDialogOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Edit Product</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-600">Product Name</label>
                        <Input
                          value={editProduct?.name || ""}
                          onChange={(e) =>
                            setEditProduct({
                              ...editProduct!,
                              name: e.target.value,
                            })
                          }
                          className="border-gray-300 0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-600">Price</label>
                        <Input
                          type="number"
                          value={editProduct?.price || 0}
                          onChange={(e) =>
                            setEditProduct({
                              ...editProduct!,
                              price: Number(e.target.value),
                            })
                          }
                          className="border-gray-300 "
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-600">Description</label>
                        <Input
                          value={editProduct?.description || ""}
                          onChange={(e) =>
                            setEditProduct({
                              ...editProduct!,
                              description: e.target.value,
                            })
                          }
                          className="border-gray-300 0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-600">Select Menu</label>
                        <Select
                          onValueChange={(value) =>
                            setEditProduct({
                              ...editProduct!,
                              category: {
                                ...editProduct!.category,
                                id: Number(value),
                              },
                            })
                          }
                          defaultValue={editProduct?.category.id.toString()}
                        >
                          <SelectTrigger className="border-gray-300 ">
                            <SelectValue placeholder="Select menu" />
                          </SelectTrigger>
                          <SelectContent>
                            {menus.map((menu) => (
                              <SelectItem key={menu.id} value={menu.id.toString()}>
                                {menu.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-600">Product Image</label>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageChange(e, true)}
                          className="border-gray-300 "
                        />
                        {(editProductImagePreview || editProduct?.imageUrl) && (
                          <div className="mt-2">
                            <img
                              src={editProductImagePreview || editProduct?.imageUrl}
                              alt="Preview"
                              className="w-32 h-32 object-cover rounded-lg shadow-sm"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={async () => {
                        await handleUpdateProduct();
                        setIsDialogOpen(false);
                      }}
                      className=" text-white"
                    >
                      Save
                    </Button>
                  </DialogContent>
                </Dialog>
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteProduct(product.id)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProductManagement;