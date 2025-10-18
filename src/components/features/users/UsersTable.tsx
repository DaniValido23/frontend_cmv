import { useState, useEffect } from 'react';
import { useUsersStore } from '@/stores/usersStore';
import { usersApi } from '@/lib/api/users';
import type { User } from '@/types/user';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import CreateUserModal from './CreateUserModal';
import EditUserModal from './EditUserModal';
import ConfirmToggleStatusModal from './ConfirmToggleStatusModal';
import { User as UserIcon, Mail, Phone, Edit, UserCheck, UserX, UserPlus, RefreshCw } from 'lucide-react';
import clsx from 'clsx';
import { toast } from 'sonner';

export default function UsersTable() {
  const { users, loading, error, loadUsers, refreshUsers } = useUsersStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showToggleStatusModal, setShowToggleStatusModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userToToggle, setUserToToggle] = useState<User | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleToggleStatus = (user: User) => {
    setUserToToggle(user);
    setShowToggleStatusModal(true);
  };

  const confirmToggleStatus = async () => {
    if (!userToToggle) return;

    const action = userToToggle.active ? 'desactivar' : 'activar';
    const actionPastTense = userToToggle.active ? 'desactivado' : 'activado';

    setIsTogglingStatus(true);

    try {
      if (userToToggle.active) {
        await usersApi.deactivateUser(userToToggle.id);
      } else {
        await usersApi.activateUser(userToToggle.id);
      }
      await loadUsers();
      toast.success(`Usuario ${actionPastTense} exitosamente`);
      setShowToggleStatusModal(false);
      setUserToToggle(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `Error al ${action} usuario`);
      setShowToggleStatusModal(false);
      setUserToToggle(null);
    } finally {
      setIsTogglingStatus(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadUsers();
    setTimeout(() => {
      setRefreshing(false);
    }, 500);
  };

  // Cargar usuarios al montar el componente
  useEffect(() => {
    loadUsers();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-8">
        <div className="text-center text-destructive">
          <p className="font-semibold">Error al cargar usuarios</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Barra de acciones */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={clsx('h-4 w-4 mr-2', refreshing && 'animate-spin')} />
            Actualizar
          </Button>

          <Button
            onClick={() => setShowCreateModal(true)}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Nuevo Usuario
          </Button>
        </div>
      </Card>

      {/* Lista de usuarios */}
      <div className="grid gap-4">
        {users.length === 0 ? (
          <Card className="p-8">
            <div className="text-center text-muted-foreground">
              <UserIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No hay usuarios registrados</p>
            </div>
          </Card>
        ) : (
          users.map((user) => (
            <Card key={user.id} className="p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between gap-6">
                {/* Avatar */}
                <div className="bg-primary/10 p-3 rounded-lg shrink-0">
                  <UserIcon className="h-6 w-6 text-primary" />
                </div>

                {/* Información del usuario */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Nombre y Username */}
                  <div className="space-y-1">
                    <h3 className="font-semibold text-base text-foreground">
                      {user.first_name} {user.last_name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      username: {user.username}
                    </p>
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase">Email</p>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-sm font-medium truncate">
                        {user.email}
                      </span>
                    </div>
                  </div>

                  {/* Teléfono */}
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase">Teléfono</p>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-sm font-medium">
                        {user.phone || 'No especificado'}
                      </span>
                    </div>
                  </div>

                  {/* Rol y Estado */}
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase">Información</p>
                    <div className="flex flex-wrap gap-2 items-center">
                      {user.role === 'doctor' ? (
                        <Badge variant="default">Doctor</Badge>
                      ) : (
                        <Badge variant="secondary">Asistente</Badge>
                      )}
                      {user.active ? (
                        <Badge variant="success">Activo</Badge>
                      ) : (
                        <Badge variant="destructive">Inactivo</Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex flex-col gap-2 shrink-0">
                  <Button
                    onClick={() => handleEdit(user)}
                    className="bg-primary/70 hover:bg-primary/80 text-primary-foreground whitespace-nowrap"
                    size="sm"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>

                  <Button
                    onClick={() => handleToggleStatus(user)}
                    variant={user.active ? 'destructive' : 'default'}
                    className={clsx(
                      'whitespace-nowrap',
                      !user.active && 'bg-success/70 hover:bg-success/80 text-success-foreground'
                    )}
                    size="sm"
                  >
                    {user.active ? (
                      <>
                        <UserX className="h-4 w-4 mr-2" />
                        Desactivar
                      </>
                    ) : (
                      <>
                        <UserCheck className="h-4 w-4 mr-2" />
                        Activar
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Modales */}
      <CreateUserModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
      <EditUserModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
      />
      <ConfirmToggleStatusModal
        open={showToggleStatusModal}
        onOpenChange={setShowToggleStatusModal}
        onConfirm={confirmToggleStatus}
        userName={userToToggle?.username || ''}
        isActive={userToToggle?.active || false}
        isLoading={isTogglingStatus}
      />
    </div>
  );
}
