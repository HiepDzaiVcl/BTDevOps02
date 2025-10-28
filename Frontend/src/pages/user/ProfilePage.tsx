import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import axiosClient from "@/apis/axiosClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "react-toastify";
import { setUser } from "@/redux/reducers/authSlice";
import { UserInfo } from "@/interfaces/user";

const ProfilePage = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const [formData, setFormData] = useState<UserInfo | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        id: user.id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber || "",
        role: user.role || "CUSTOMER",
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  const handleRoleChange = (value: 'ADMIN' | 'CUSTOMER') => {
    setFormData((prev) => (prev ? { ...prev, role: value } : null));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    try {
      const updatedData: Partial<UserInfo> = { ...formData };

      const response = await axiosClient.put(`/users/${formData.id}`, updatedData);
      const updatedUser: UserInfo = response.data;

      dispatch(setUser({ user: updatedUser }));

      setFormData({
        ...updatedUser,
        role: updatedUser.role || "CUSTOMER",
      });

      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update profile.");
    }
  };

  if (!user) {
    return (
      <p className="text-center text-gray-500 mt-10">
        Please login to view your profile.
      </p>
    );
  }

  return (
    <div className="max-w-lg mx-auto mt-10">
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r  rounded-t-lg">
          <CardTitle className="text-2xl font-bold">Your Profile</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label
                htmlFor="name"
                className="text-sm font-medium text-gray-700"
              >
                Name
              </Label>
              <Input
                id="name"
                name="name"
                value={formData?.name || ""}
                onChange={handleInputChange}
                className="mt-1"
                placeholder="Enter your name"
              />
            </div>
            <div>
              <Label
                htmlFor="email"
                className="text-sm font-medium text-gray-700"
              >
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData?.email || ""}
                onChange={handleInputChange}
                className="mt-1"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <Label
                htmlFor="phoneNumber"
                className="text-sm font-medium text-gray-700"
              >
                Phone Number
              </Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                value={formData?.phoneNumber || ""}
                onChange={handleInputChange}
                className="mt-1"
                placeholder="Enter your phone number"
              />
            </div>
            <div>
              <Label
                htmlFor="role"
                className="text-sm font-medium text-gray-700"
              >
                Role
              </Label>
              <Select
                value={formData?.role || "CUSTOMER"} 
                onValueChange={handleRoleChange}
                disabled={user.role !== "ADMIN"}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CUSTOMER">Customer</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex space-x-3 mt-6">
              <Button type="submit" >
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;