import { useState, type FormEvent } from "react";
import { supabase } from "../lib/supabase";
import "./AuthForm.css";

type Mode = "signin" | "signup";

export default function AuthForm() {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password || submitting) return;

    setSubmitting(true);
    setError(null);
    setNotice(null);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: trimmedEmail,
          password,
        });
        if (error) throw error;
        if (data.user && !data.session) {
          setNotice("확인 이메일을 보냈어요. 메일의 링크를 클릭해 가입을 완료해 주세요.");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했어요.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <h2 className="auth-form__title">
        {mode === "signin" ? "로그인" : "회원가입"}
      </h2>
      <p className="auth-form__hint">이메일로 로그인해야 방명록을 볼 수 있어요.</p>

      <div className="auth-form__field">
        <label className="auth-form__label" htmlFor="auth-email">
          이메일
        </label>
        <input
          id="auth-email"
          className="auth-form__input"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={submitting}
        />
      </div>

      <div className="auth-form__field">
        <label className="auth-form__label" htmlFor="auth-password">
          비밀번호
        </label>
        <input
          id="auth-password"
          className="auth-form__input"
          type="password"
          autoComplete={mode === "signin" ? "current-password" : "new-password"}
          placeholder="비밀번호 (6자 이상)"
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={submitting}
        />
      </div>

      {error && <p className="auth-form__error">{error}</p>}
      {notice && <p className="auth-form__notice">{notice}</p>}

      <button className="auth-form__submit" type="submit" disabled={submitting}>
        {submitting
          ? "처리 중…"
          : mode === "signin"
          ? "로그인"
          : "회원가입"}
      </button>

      <button
        type="button"
        className="auth-form__toggle"
        onClick={() => {
          setMode((m) => (m === "signin" ? "signup" : "signin"));
          setError(null);
          setNotice(null);
        }}
        disabled={submitting}
      >
        {mode === "signin"
          ? "계정이 없나요? 회원가입"
          : "이미 계정이 있나요? 로그인"}
      </button>
    </form>
  );
}
