import { dbGetNotesByStatus, dbUpdateNote } from "lib/db";
import { createNote, deleteNote, fetchNote, updateNote } from "lib/api";

// Sync added notes
export const syncAddedNotes = async () => {
  const notesToAdd = await dbGetNotesByStatus("NEW");
  if (notesToAdd.length === 0) return;
  for (const localNote of notesToAdd) {
    try {
      await createNote(localNote);
      await dbUpdateNote({
        ...localNote,
        syncStatus: "SYNCED",
      });
    } catch (error) {
      console.error("Sync failed for note", localNote);
    }
  }
};

// Sync updated notes
export const syncUpdatedNotes = async () => {
  const notesToSync = await dbGetNotesByStatus("UPDATED");

  for (const localNote of notesToSync) {
    try {
      const response = await fetchNote(localNote.uid);
      const serverNote = response.data;
      if (serverNote) {
        await updateNote(localNote);
        await dbUpdateNote({
          ...localNote,
          syncStatus: "SYNCED",
        });
      }
    } catch (error) {
      console.error("Sync failed for updated note", error);
    }
  }
};

// Sync deleted notes
export const syncDeletedNotes = async () => {
  const notesToDelete = await dbGetNotesByStatus("DELETED");

  for (const localNote of notesToDelete) {
    try {
      const response = await fetchNote(localNote.uid);
      const serverNote = response.data;

      if (serverNote) {
        await deleteNote(localNote.uid);
        await dbUpdateNote({
          ...localNote,
          syncStatus: "SYNCED",
        });
      }
    } catch (error) {
      console.error("Sync failed for deleted note", error);
    }
  }
};
