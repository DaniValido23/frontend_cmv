import { useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
  useExpenseCategories,
  useCreateExpenseCategory,
  useUpdateExpenseCategory,
  useDeleteExpenseCategory,
} from "@/hooks/useExpenseCategories";
import type { ExpenseCategory, CreateExpenseCategoryRequest } from "@/types/balance";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";

interface ExpenseFormData {
  name: string;
  description?: string;
  type: "fixed" | "operational";
}

export default function ExpenseCategoryManager() {
  const { data: categories, isLoading, error } = useExpenseCategories();
  const createMutation = useCreateExpenseCategory();
  const updateMutation = useUpdateExpenseCategory();
  const deleteMutation = useDeleteExpenseCategory();

  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null);
  const [deleteCategory, setDeleteCategory] = useState<ExpenseCategory | null>(null);
  const [activeTab, setActiveTab] = useState<"fixed" | "operational">("fixed");

  const [formData, setFormData] = useState<ExpenseFormData>({
    name: "",
    description: "",
    type: "fixed",
  });

  const fixedCategories = categories?.filter((c) => c.type === "fixed") || [];
  const operationalCategories = categories?.filter((c) => c.type === "operational") || [];

  const openCreateForm = (type: "fixed" | "operational") => {
    setFormData({
      name: "",
      description: "",
      type,
    });
    setFormOpen(true);
  };

  const openEditForm = (category: ExpenseCategory) => {
    setFormData({
      name: category.name,
      description: category.description || "",
      type: category.type,
    });
    setEditingCategory(category);
  };

  const handleCreate = () => {
    if (!formData.name.trim()) return;
    createMutation.mutate(
      {
        name: formData.name.trim(),
        description: formData.description?.trim() || undefined,
        type: formData.type,
      },
      { onSuccess: () => setFormOpen(false) }
    );
  };

  const handleUpdate = () => {
    if (!editingCategory || !formData.name.trim()) return;
    updateMutation.mutate(
      {
        id: editingCategory.id,
        data: {
          name: formData.name.trim(),
          description: formData.description?.trim() || undefined,
        },
      },
      { onSuccess: () => setEditingCategory(null) }
    );
  };

  const handleDelete = () => {
    if (!deleteCategory) return;
    deleteMutation.mutate(deleteCategory.id, {
      onSuccess: () => setDeleteCategory(null),
    });
  };

  const renderCategoryList = (categoryList: ExpenseCategory[], type: "fixed" | "operational") => {
    if (categoryList.length === 0) {
      return (
        <p className="text-center py-8 text-muted-foreground">
          No hay categorias {type === "fixed" ? "fijas" : "operativas"}. Crea una para empezar.
        </p>
      );
    }

    return (
      <div className="space-y-2">
        {categoryList.map((category) => (
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
                onClick={() => openEditForm(category)}
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
    );
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
          Error al cargar categorias de gastos
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
            <div className="flex justify-between items-center mb-4">
              <TabsList>
                <TabsTrigger value="fixed">
                  Gastos Fijos ({fixedCategories.length})
                </TabsTrigger>
                <TabsTrigger value="operational">
                  Operativos ({operationalCategories.length})
                </TabsTrigger>
              </TabsList>
              <Button size="sm" onClick={() => openCreateForm(activeTab)}>
                <Plus className="h-4 w-4 mr-1" />
                Nueva categoria
              </Button>
            </div>

            <TabsContent value="fixed">
              {renderCategoryList(fixedCategories, "fixed")}
            </TabsContent>
            <TabsContent value="operational">
              {renderCategoryList(operationalCategories, "operational")}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Create/Edit Form Dialog */}
      <Dialog
        open={formOpen || !!editingCategory}
        onOpenChange={(open) => {
          if (!open) {
            setFormOpen(false);
            setEditingCategory(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Editar categoria" : "Nueva categoria de gasto"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Renta, Luz, Salarios, etc."
              />
            </div>

            <div>
              <Label htmlFor="description">Descripcion (opcional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descripcion de la categoria"
                rows={2}
              />
            </div>

            {!editingCategory && (
              <div>
                <Label>Tipo</Label>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      checked={formData.type === "fixed"}
                      onChange={() => setFormData({ ...formData, type: "fixed" })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Gasto Fijo</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      checked={formData.type === "operational"}
                      onChange={() => setFormData({ ...formData, type: "operational" })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Operativo</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setFormOpen(false);
                setEditingCategory(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={editingCategory ? handleUpdate : handleCreate}
              isLoading={createMutation.isPending || updateMutation.isPending}
            >
              {editingCategory ? "Guardar cambios" : "Crear categoria"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
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
