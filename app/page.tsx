import FinanceForm from "./components/finance-form";
import Instructions from "./components/instructions";
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <Instructions />
      <FinanceForm />
    </main>
  );
}
