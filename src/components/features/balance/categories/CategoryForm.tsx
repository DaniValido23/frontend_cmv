import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/Modal";

interface CategoryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { name: string; description?: string }) => void;
  isLoading?: boolean;
  initialData?: {
    name: string;
    description?: string;
  };
  title: string;
}

export default function CategoryForm({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
  initialData,
  title,
}: CategoryFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDescription(initialData.description || "");
    } else {
      setName("");
      setDescription("");
    }
  }, [initialData, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Rayos X, Renta, etc."
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Descripcion (opcional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripcion de la categoria"
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" isLoading={isLoading}>
              {initialData ? "Guardar cambios" : "Crear categoria"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
