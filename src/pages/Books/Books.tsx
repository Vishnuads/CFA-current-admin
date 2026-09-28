
import BooksTable from "./BooksTable";

export default function Books() {
  return (
    <>
      <section className="max-w-5xl mx-auto p-4 lg:p-8  ">
        <h1 className="text-2xl font-semibold">Book Orders Dashboard</h1>
        <div className="mt-4">
          <BooksTable />
        </div>
      </section>
    </>
  );
}
