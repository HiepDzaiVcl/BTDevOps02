import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axiosClient from "@/apis/axiosClient";
import { Link, useNavigate } from "react-router-dom";

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axiosClient.post("/auth/register", {
        name,
        phoneNumber,
        email,
        password,
      });
      navigate("/login");
    } catch (error) {
      console.error("Register failed:", error);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-center">REGISTER</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          type="text"
          placeholder="Phone Number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
        />
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit" className="w-full">
          Register
        </Button>
      </form>
      <div className="mt-4 text-center text-sm">
         Already have an account?{" "}
        <Link to="/login" className="underline hover:text-blue-900">
          Login now
        </Link>
      </div>
    </div>
  );
};

export default RegisterPage;
