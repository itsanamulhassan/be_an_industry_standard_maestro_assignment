import { ClientSession, startSession } from "mongoose";

// A helper function that runs database code inside a transaction.
// - If everything succeeds → commit (save changes).
// - If something fails → rollback (undo changes).
type TransactionHandler<T> = (session: ClientSession) => Promise<T>;

export const withTransaction = async <T>(
  handler: TransactionHandler<T>
): Promise<T> => {
  // 1. Start a new session (like opening a new DB "tab")
  const session = await startSession();

  // 2. Begin a transaction (group changes together)
  session.startTransaction();

  try {
    // 3. Run the user-provided code with access to this session
    const result = await handler(session);

    // 4. If no errors → commit the transaction
    await session.commitTransaction();

    // 5. Return the result of the handler
    return result;
  } catch (error) {
    // 6. If there’s any error → rollback the transaction (undo all changes)
    await session.abortTransaction();
    throw error; // re-throw so the caller knows something went wrong
  } finally {
    // 7. End the session
    session.endSession();
  }
};
