import StudyCategoryManager from "../categories/StudyCategoryManager";
import ExpenseCategoryManager from "../categories/ExpenseCategoryManager";

export default function ConfigTab() {
  return (
    <div className="space-y-8">
      <section>
        <h3 className="text-lg font-semibold mb-4">Categorias de Estudios</h3>
        <StudyCategoryManager />
      </section>
      <section>
        <h3 className="text-lg font-semibold mb-4">Categorias de Gastos</h3>
        <ExpenseCategoryManager />
      </section>
    </div>
  );
}
