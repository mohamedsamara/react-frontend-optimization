import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

import {
  dbAddNote,
  dbGetNotes,
  dbUpdateNote,
  dbDeleteNote,
  dbUpdateNoteStatus,
} from "lib/db";
import { createNote, deleteNote, updateNote } from "lib/api";
import { triggerSyncTask } from "lib/sync";
import { Note } from "lib/types";
import { NoteFormValues } from "lib/validations";
import { POST_MESSAGES, SYNC_NOTES } from "lib/constants";
import { useOnlineStatus } from "lib/hooks";

export const useNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const isOnline = useOnlineStatus();

  const refreshNotes = async () => {
    const dbNotes = await dbGetNotes();
    const formattedNotes = dbNotes
      .filter((n) => !n.isDeleted)
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    setNotes(formattedNotes);
  };

  useEffect(() => {
    refreshNotes();
    const interval = setInterval(refreshNotes, 5000);
    return () => clearInterval(interval);
  }, []);

  // NOTES_SYNC_COMPLETE Listener
  useEffect(() => {
    const syncMessageListener = (event: MessageEvent) => {
      if (event.data && event.data.action === POST_MESSAGES.NOTES_SYNC_COMPLETE)
        refreshNotes();
    };
    navigator.serviceWorker.addEventListener("message", syncMessageListener);
    return () => {
      navigator.serviceWorker.removeEventListener(
        "message",
        syncMessageListener
      );
    };
  }, []);

  const handleAddNote = async (payload: NoteFormValues) => {
    try {
      const note = await dbAddNote({
        ...payload,
        uid: uuidv4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isDeleted: false,
        syncStatus: "NONE",
      });

      setNotes((prevNotes) => [note, ...prevNotes]);

      if (isOnline) {
        // Add remote note
        await createNote(note);
      } else {
        await dbUpdateNoteStatus(note.id, "NEW");
        triggerSyncTask(SYNC_NOTES.NEW);
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  const handleUpdateNote = async (note: Note) => {
    try {
      setNotes((prevNotes) =>
        prevNotes.map((n) => (n.uid === note.uid ? { ...note } : n))
      );

      // Update local note
      await dbUpdateNote(note);

      if (isOnline) {
        await updateNote(note);
      } else {
        // Don't trigger sync for new notes
        if (note.syncStatus === "NEW") return;
        await dbUpdateNoteStatus(note.uid, "UPDATED");
        triggerSyncTask(SYNC_NOTES.UPDATED);
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  const handleDeleteNote = async (note: Note) => {
    try {
      setNotes((prevNotes) => prevNotes.filter((n) => n.uid !== note.uid));

      // Update note
      await dbUpdateNote({
        ...note,
        isDeleted: true,
        updatedAt: new Date().toISOString(),
      });

      if (isOnline) {
        // Delete from server
        await deleteNote(note.uid);
      } else {
        if (note.syncStatus === "NEW") {
          // Delete note completely if NEW
          await dbDeleteNote(note.uid);
          return;
        }
        await dbUpdateNoteStatus(note.uid, "DELETED");
        triggerSyncTask(SYNC_NOTES.DELETED);
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  return {
    notes,
    addNote: handleAddNote,
    deleteNote: handleDeleteNote,
    updateNote: handleUpdateNote,
  };
};
