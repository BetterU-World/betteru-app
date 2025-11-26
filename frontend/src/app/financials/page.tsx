import Header from "@/components/Header";

export default function FinancialsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-2">Financials</h1>
        <p className="text-slate-600">
          Financial tracking coming soon. This will show income, expenses, and insights.
        </p>
      </div>
    </div>
  );
}
