import { useState, useEffect } from 'react';
import { usersApi } from '@/lib/api/users';
import type { User, UpdateUserRequest } from '@/types/user';
import { useUsersStore } from '@/stores/usersStore';
import { useAuthStore } from '@/stores/authStore';
import { queryClient } from '@/lib/queryClient';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Label from '@/components/ui/Label';
import Badge from '@/components/ui/Badge';
import { UserCog } from 'lucide-react';
import { toast } from 'sonner';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export default function EditUserModal({ isOpen, onClose, user }: EditUserModalProps) {
  const { loadUsers } = useUsersStore();
  const { user: currentUser, updateUser: updateAuthUser } = useAuthStore();
  const [formData, setFormData] = useState<UpdateUserRequest>({
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone || '',
      });
    }
  }, [user]);

  // Función para verificar si los datos han cambiado
  const hasDataChanged = (): boolean => {
    if (!user) return false;

    return (
      (formData.email ?? '').trim() !== user.email.trim() ||
      (formData.first_name ?? '').trim() !== user.first_name.trim() ||
      (formData.last_name ?? '').trim() !== user.last_name.trim() ||
      (formData.phone ?? '').trim() !== (user.phone || '').trim()
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      // Solo enviar los campos que han cambiado
      const dataToSend: UpdateUserRequest = {};

      if (formData.email !== user.email) dataToSend.email = formData.email;
      if (formData.first_name !== user.first_name) dataToSend.first_name = formData.first_name;
      if (formData.last_name !== user.last_name) dataToSend.last_name = formData.last_name;
      if (formData.phone !== (user.phone || '')) dataToSend.phone = formData.phone;

      await usersApi.updateUser(user.id, dataToSend);

      // Si el usuario editado es el usuario actual logueado, actualizar sessionStorage
      if (currentUser && currentUser.id === user.id) {
        updateAuthUser(dataToSend);
      }

      // Invalidar queries relevantes para refrescar datos
      await loadUsers(); // Recargar la tabla automáticamente
      queryClient.invalidateQueries({ queryKey: ["doctors"] }); // Invalidar lista de doctores

      toast.success('Usuario actualizado exitosamente');
      handleClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al actualizar usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      email: '',
      first_name: '',
      last_name: '',
      phone: '',
    });
    onClose();
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <UserCog className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle>Editar Usuario</DialogTitle>
          <DialogDescription>
            Editando: <span className="font-medium text-foreground">{user.username}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit_first_name">Nombre</Label>
              <Input
                id="edit_first_name"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_last_name">Apellido</Label>
              <Input
                id="edit_last_name"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit_email">Email</Label>
            <Input
              type="email"
              id="edit_email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit_phone">Teléfono</Label>
            <Input
              type="tel"
              id="edit_phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="2831252451"
            />
          </div>

          <div className="bg-muted/50 border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Rol del usuario</p>
                <p className="text-xs text-muted-foreground mt-1">El rol no se puede modificar</p>
              </div>
              {user.role === 'doctor' ? (
                <Badge variant="default">Doctor</Badge>
              ) : (
                <Badge variant="secondary">Asistente</Badge>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || !hasDataChanged()}
              isLoading={loading}
            >
              <UserCog className="w-4 h-4 mr-2" />
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
