
import EventsTable from "./EventsTable";

export default function Events() {
  return (
    <>
      <section className="max-w-4xl mx-auto">
        {/* <div className="flex items-center justify-between mb-4 px-3">
          <h1 className="font-semibold text-2xl">All Events</h1>

          <Link to="/create-event">
            <Button
              size="sm"
              variant="primary"
              startIcon={<PlusIcon className="size-3" fill="white" />}
            >
              Create
            </Button>
          </Link>
        </div> */}

        <EventsTable />
      </section>
    </>
  );
}
