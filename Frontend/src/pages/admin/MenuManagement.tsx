import { useEffect, useState } from 'react';
import axiosClient from '@/apis/axiosClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'react-toastify';

interface Menu {
  id: number;
  name: string;
}

const MenuManagement = () => {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [newMenu, setNewMenu] = useState('');
  const [editMenu, setEditMenu] = useState<Menu | null>(null);

  const fetchMenus = async () => {
    try {
      const response = await axiosClient.get('/menus');
      setMenus(response.data);
    } catch (error) {
      console.error('Failed to fetch menus:', error);
    }
  };

  const handleCreateMenu = async () => {
    try {
      if (!newMenu) {
        toast.error("Please new menu name");
        return;
      }
      const response = await axiosClient.post('/menus', { name: newMenu });
      setMenus([...menus, response.data]);
      setNewMenu('');
      toast.success('Menu updated successfully');
    } catch (error) {
      console.error('Failed to create menu:', error);
    }
  };

  const handleUpdateMenu = async () => {
    if (!editMenu) return;
    try {
      const response = await axiosClient.put(`/menus/${editMenu.id}`, { name: editMenu.name });
      setMenus(menus.map((menu) => (menu.id === editMenu.id ? response.data : menu)));
      setEditMenu(null);
      toast.success("Menu updated successfully");
    } catch (error) {
      console.error('Failed to update menu:', error);
    }
  };

  const handleDeleteMenu = async (id: number) => {
    try {
      await axiosClient.delete(`/menus/${id}`);
      setMenus(menus.filter((menu) => menu.id !== id));
      toast.success('Order deleted successfully!');
    } catch (error) {
      console.error('Failed to delete menu:', error);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Menu Management</h2>
      <div className="mb-4 flex gap-4">
        <Input
          placeholder="New menu name"
          value={newMenu}
          onChange={(e) => setNewMenu(e.target.value)}
        />
        <Button onClick={handleCreateMenu}>Create Menu</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {menus.map((menu, index) => (
            <TableRow key={menu.id}>
              <TableCell>{index+1}</TableCell>
              <TableCell>{menu.name}</TableCell>
              <TableCell>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="mr-2" onClick={() => setEditMenu(menu)}>
                      Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Menu</DialogTitle>
                    </DialogHeader>
                    <Input
                      value={editMenu?.name || ''}
                      onChange={(e) => setEditMenu({ ...editMenu!, name: e.target.value })}
                    />
                    <Button onClick={handleUpdateMenu}>Save</Button>
                  </DialogContent>
                </Dialog>
                <Button variant="destructive" onClick={() => handleDeleteMenu(menu.id)}>
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

export default MenuManagement;