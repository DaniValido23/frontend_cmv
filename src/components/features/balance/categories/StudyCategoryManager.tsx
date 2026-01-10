import { useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
  useStudyCategories,
  useCreateStudyCategory,
  useUpdateStudyCategory,
  useDeleteStudyCategory,
} from "@/hooks/useStudyCategories";
import type { StudyCategory } from "@/types/balance";
import CategoryForm from "./CategoryForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/Modal";

export default function StudyCategoryManager() {
  const { data: categories, isLoading, error } = useStudyCategories();
  const createMutation = useCreateStudyCategory();
  const updateMutation = useUpdateStudyCategory();
  const deleteMutation = useDeleteStudyCategory();

  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<StudyCategory | null>(null);
  const [deleteCategory, setDeleteCategory] = useState<StudyCategory | null>(null);

  const handleCreate = (data: { name: string; description?: string }) => {
    createMutation.mutate(data, {
      onSuccess: () => setFormOpen(false),
    });
  };

  const handleUpdate = (data: { name: string; description?: string }) => {
    if (!editingCategory) return;
    updateMutation.mutate(
      { id: editingCategory.id, data },
      { onSuccess: () => setEditingCategory(null) }
    );
  };

  const handleDelete = () => {
    if (!deleteCategory) return;
    deleteMutation.mutate(deleteCategory.id, {
      onSuccess: () => setDeleteCategory(null),
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-destructive">
          Error al cargar categorias de estudios
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-muted-foreground">
              {categories?.length || 0} categorias
            </p>
            <Button size="sm" onClick={() => setFormOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Nueva categoria
            </Button>
          </div>

          {categories && categories.length > 0 ? (
            <div className="space-y-2">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div>
                    <p className="font-medium">{category.name}</p>
                    {category.description && (
                      <p className="text-sm text-muted-foreground">
                        {category.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setEditingCategory(category)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setDeleteCategory(category)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground">
              No hay categorias de estudios. Crea una para empezar.
            </p>
          )}
        </CardContent>
      </Card>

      <CategoryForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleCreate}
        isLoading={createMutation.isPending}
        title="Nueva categoria de estudio"
      />

      <CategoryForm
        open={!!editingCategory}
        onOpenChange={(open) => !open && setEditingCategory(null)}
        onSubmit={handleUpdate}
        isLoading={updateMutation.isPending}
        initialData={editingCategory || undefined}
        title="Editar categoria"
      />

      <Dialog open={!!deleteCategory} onOpenChange={(open) => !open && setDeleteCategory(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar categoria</DialogTitle>
            <DialogDescription>
              ¿Estas seguro de eliminar la categoria "{deleteCategory?.name}"? Esta accion no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteCategory(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              isLoading={deleteMutation.isPending}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
