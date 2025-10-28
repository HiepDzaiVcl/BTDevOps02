/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import axiosClient from "@/apis/axiosClient";
import { Button } from "@/components/ui/button";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "react-toastify";
import { formatCurrency } from "@/utils/FormatCurrency";

interface Order {
  id: number;
  user: { id: number; email: string };
  table: {
    id: number;
    tableName: string;
    capacity: number;
    status: string;
    reservations: Reservation[];
  } | null;
  orderTime: string;
  totalAmount: number;
  status: string;
  items: OrderItem[];
}

interface OrderItem {
  id: number;
  product: { id: number; name: string; price: number, imageUrl: string };
  quantity: number;
  price: number;
}

interface Reservation {
  id: number;
  user: { id: number; email: string };
  numPeople: number;
  reservationTime: string;
  status: string;
}

const OrderManagement = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [editOrder, setEditOrder] = useState<Order | null>(null);
  const [viewOrder, setViewOrder] = useState<Order | null>(null);

  const fetchOrders = async () => {
    try {
      const response = await axiosClient.get("/orders");
      setOrders(response.data);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      toast.error("Failed to fetch orders. Please try again.");
    }
  };

  const handleUpdateOrder = async () => {
    if (!editOrder || !editOrder.id) {
      toast.error("No order selected to update.");
      return;
    }
    try {
      const response = await axiosClient.put(
        `/orders/${editOrder.id}/status`,
        editOrder.status,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      setOrders(
        orders.map((order) =>
          order.id === editOrder.id ? response.data : order
        )
      );
      setEditOrder(null);
      toast.success("Order updated successfully!");
    } catch (error: any) {
      console.error("Failed to update order:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to update order. Please try again.";
      toast.error(errorMessage);
    }
  };

  const handleDeleteOrder = async (id: number) => {
    try {
      const orderToDelete = orders.find((order) => order.id === id);
      if (!orderToDelete) {
        toast.error("Order not found.");
        return;
      }

      if (orderToDelete.status === "COMPLETED") {
        toast.error("Cannot delete because the order is completed!");
        return;
      }

      await axiosClient.delete(`/orders/${id}`);
      setOrders(orders.filter((order) => order.id !== id));
      toast.success("Order deleted successfully!");
    } catch (error: any) {
      console.error("Failed to delete order:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to delete order. Please try again.";
      toast.error(errorMessage);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Order Management</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>User Email</TableHead>
            <TableHead>Order Time</TableHead>
            <TableHead>Total Amount</TableHead>
            <TableHead>Items Count</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order, index) => (
            <TableRow key={order.id}>
              <TableCell>{index+1}</TableCell>
              <TableCell>{order.user.email}</TableCell>
              <TableCell>
                {new Date(order.orderTime).toLocaleString()}
              </TableCell>
              <TableCell>{formatCurrency(order.totalAmount)}</TableCell>
              <TableCell>{order.items.length}</TableCell>
              <TableCell>{order.status}</TableCell>
              <TableCell>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="mr-2"
                      onClick={() => setViewOrder(order)}
                    >
                      View
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        Order Details - ID: {viewOrder?.id}
                      </DialogTitle>
                    </DialogHeader>
                    {viewOrder && (
                      <div className="space-y-2">
                        <p>
                          <strong>User Email:</strong> {viewOrder.user.email}
                        </p>
                        <p>
                          <strong>Order Time:</strong>{" "}
                          {new Date(viewOrder.orderTime).toLocaleString()}
                        </p>
                        <p>
                          <strong>Total Amount:</strong>{" "} 
                           {formatCurrency(viewOrder.totalAmount)}
                        </p>
                        <p>
                          <strong>Status:</strong> {viewOrder.status}
                        </p>
                        {viewOrder.table && (
                          <p>
                            <strong>Table:</strong> {viewOrder.table.tableName}{" "}
                            (Capacity: {viewOrder.table.capacity})
                          </p>
                        )}
                        <h4 className="font-semibold mt-4">Items:</h4>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Image</TableHead>
                              <TableHead>Product</TableHead>
                              <TableHead>Price</TableHead>
                              <TableHead>Quantity</TableHead>
                              <TableHead>Total</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {viewOrder.items.map((item) => (
                              <TableRow key={item.id}>
                                <TableCell><img src={item.product.imageUrl} className="w-14 h-14 rounded-sm" alt="" /></TableCell>
                                <TableCell>{item.product.name}</TableCell>
                                <TableCell>
                                  {formatCurrency(item.product.price)}
                                </TableCell>
                                <TableCell>{item.quantity}</TableCell>
                                <TableCell>
                                  {formatCurrency(item.quantity * item.product.price
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="mr-2"
                      onClick={() => setEditOrder(order)}
                    >
                      Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Order</DialogTitle>
                    </DialogHeader>
                    <Select
                      onValueChange={(value) =>
                        setEditOrder({ ...editOrder!, status: value })
                      }
                      value={editOrder?.status}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                        <SelectItem value="CANCELLED">Canceled</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={handleUpdateOrder}>Save</Button>
                  </DialogContent>
                </Dialog>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">Delete</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you sure you want to delete this order?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete the order from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-500 text-white"
                        onClick={() => handleDeleteOrder(order.id)}
                      >
                        Continue
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default OrderManagement;
