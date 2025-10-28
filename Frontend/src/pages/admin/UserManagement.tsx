/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { UserInfo } from "@/interfaces/user";
import {  useSelector } from "react-redux";
import { RootState } from "@/redux/store";

interface CreateUserForm {
  name: string;
  email: string;
  password: string;
  role: "ADMIN" | "CUSTOMER";
}

const UserManagement = () => {
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [editUser, setEditUser] = useState<UserInfo | null>(null);
  const [createUserForm, setCreateUserForm] = useState<CreateUserForm | null>(
    null
  );
  const { user: userCurrent } = useSelector((state: RootState) => state.auth);


  const fetchUsers = async () => {
    try {
      const response = await axiosClient.get("/users");
      setUsers(response.data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast.error("Failed to fetch users.");
    }
  };

  const handleUpdateUser = async () => {
    if (!editUser) return;
    try {
      const response = await axiosClient.put(`/users/${editUser.id}`, {
        name: editUser.name,
        email: editUser.email,
        role: editUser.role,
      });
      setUsers(
        users.map((user) => (user.id === editUser.id ? response.data : user))
      );
      setEditUser(null);
      toast.success("User updated successfully!");
    } catch (error: any) {
      console.error("Failed to update user:", error);
      toast.error(error.response?.data?.message || "Failed to update user.");
    }
  };

  const handleDeleteUser = async (id: number) => {
    try {
      await axiosClient.delete(`/users/${id}`);
      setUsers(users.filter((user) => user.id !== id));
      toast.success("User deleted successfully!");
    } catch (error: any) {
      console.error("Failed to delete user:", error);
      toast.error(error.response?.data?.message || "Failed to delete user.");
    }
  };

  const handleCreateUser = async () => {
    if (!createUserForm) return;
    try {
      const response = await axiosClient.post("/users", createUserForm);
      setUsers([...users, response.data]);
      setCreateUserForm(null);
      toast.success("User created successfully!");
    } catch (error: any) {
      console.error("Failed to create user:", error);
      toast.error(error.response?.data?.message || "Failed to create user.");
    }
  };

  useEffect(() => {
    fetchUsers();
    if (createUserForm === null) {
      setCreateUserForm({
        name: "",
        email: "",
        password: "",
        role: "CUSTOMER",
      });
    }
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">User Management</h2>
      </div>
      <div className="flex flex-grow gap-4 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1 text-gray-600">
            Name
          </label>
          <Input
            placeholder="Name"
            value={createUserForm?.name || ""}
            onChange={(e) =>
              setCreateUserForm({ ...createUserForm!, name: e.target.value })
            }
            className="mb-2"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1 text-gray-600">
            Email
          </label>
          <Input
            placeholder="Email"
            type="email"
            value={createUserForm?.email || ""}
            onChange={(e) =>
              setCreateUserForm({ ...createUserForm!, email: e.target.value })
            }
            className="mb-2"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1 text-gray-600">
            Password
          </label>
          <Input
            placeholder="Password"
            type="password"
            value={createUserForm?.password || ""}
            onChange={(e) =>
              setCreateUserForm({
                ...createUserForm!,
                password: e.target.value,
              })
            }
            className="mb-2"
          />
        </div>
        <div className="flex-1 mb-2">
          <label className="block text-sm font-medium mb-1 text-gray-600">
            Select role
          </label>
          <Select
            onValueChange={(value: string) =>
              setCreateUserForm({
                ...createUserForm!,
                role: value as "ADMIN" | "CUSTOMER",
              })
            }
            defaultValue={createUserForm?.role || "CUSTOMER"}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ADMIN">Admin</SelectItem>
              <SelectItem value="CUSTOMER">Customer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleCreateUser} className="mb-2">
          Create user
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user, index) => (
            <TableRow key={user.id}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="mr-2"
                      onClick={() => setEditUser(user)}
                      disabled={user?.id === userCurrent?.id}
                    >
                      Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit User</DialogTitle>
                    </DialogHeader>
                    <Input
                      value={editUser?.name || ""}
                      onChange={(e) =>
                        setEditUser({ ...editUser!, name: e.target.value })
                      }
                      className="mb-2"
                    />
                    <Input
                      value={editUser?.email || ""}
                      onChange={(e) =>
                        setEditUser({ ...editUser!, email: e.target.value })
                      }
                      className="mb-2"
                    />
                    <Select
                      onValueChange={(value: string) =>
                        setEditUser({
                          ...editUser!,
                          role: value as "ADMIN" | "CUSTOMER",
                        })
                      }
                      defaultValue={editUser?.role}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                        <SelectItem value="CUSTOMER">Customer</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={handleUpdateUser} className="mt-4">
                      Save
                    </Button>
                  </DialogContent>
                </Dialog>
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteUser(user.id)}
                  disabled={user?.id === userCurrent?.id}
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

export default UserManagement;
