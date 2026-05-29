import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./lib/supabase";
import {
  insertGuestbookEntry,
  listGuestbookEntries,
} from "./services/guestbookService";
import type {
  GuestbookEntry,
  GuestbookInsertPayload,
} from "./types/guestbook";
import AuthForm from "./components/AuthForm";
import GuestbookForm from "./components/GuestbookForm";
import GuestbookList from "./components/GuestbookList";
import "./App.css";

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) {
      setEntries([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    listGuestbookEntries()
      .then((data) => {
        if (!cancelled) setEntries(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [session]);

  const handleAdd = useCallback(
    async (payload: GuestbookInsertPayload) => {
      const entry = await insertGuestbookEntry(payload);
      setEntries((prev) => [entry, ...prev]);
    },
    []
  );

  if (!authReady) {
    return (
      <div className="app">
        <p className="app__subtitle" style={{ textAlign: "center" }}>
          불러오는 중…
        </p>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">방명록</h1>
        <p className="app__subtitle">이름과 한마디를 남겨 주세요.</p>
        {session && (
          <button
            className="app__signout"
            type="button"
            onClick={() => supabase.auth.signOut()}
          >
            {session.user.email} · 로그아웃
          </button>
        )}
      </header>

      <main className="app__main">
        {session ? (
          <>
            <GuestbookForm onSubmit={handleAdd} />
            <GuestbookList entries={entries} loading={loading} />
          </>
        ) : (
          <AuthForm />
        )}
      </main>
    </div>
  );
}
