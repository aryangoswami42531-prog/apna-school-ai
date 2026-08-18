// API Client for XYZ AI Backend

export function authHeaders(extra = {}) {
  const token = localStorage.getItem("xyz_session_token");
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra
  };
}

export async function fetchErp(path) {
  const res = await fetch(`/api/erp/${path}`, {
    headers: authHeaders()
  });
  return res.json();
}

export async function transcribeAudio(blob, language = "English") {
  const form = new FormData();
  form.append("audio", blob, "speech.webm");
  form.append("language", language);
  const res = await fetch("/api/stt", {
    method: "POST",
    headers: authHeaders(),
    body: form
  });
  return res.json();
}
