/** Must match the `name` of the static detection form in index.html — Netlify
 * registers forms by parsing the deployed HTML, which never contains the
 * React-rendered one, so that hidden copy is what makes submissions land. */
export const CONTACT_FORM_NAME = 'contact';

/** Honeypot field Netlify silently drops submissions for when it's filled in. */
export const HONEYPOT_FIELD = 'bot-field';

type FetchLike = (input: string, init: RequestInit & { headers: Record<string, string> }) => Promise<Response>;

/** Serializes the form as `application/x-www-form-urlencoded`, the only body
 * format Netlify Forms accepts from an AJAX submission, and guarantees exactly
 * one `form-name` so Netlify can route it to the right form. */
export function encodeFormBody(data: FormData): string {
  const params = new URLSearchParams();
  params.append('form-name', CONTACT_FORM_NAME);

  data.forEach((value, key) => {
    if (key !== 'form-name' && typeof value === 'string') {
      params.append(key, value);
    }
  });

  return params.toString();
}

/** Posts the form to Netlify. Resolves on a 2xx response and rejects otherwise,
 * so callers can show a real error instead of a false "sent". */
export async function submitContactForm(data: FormData, fetchImpl: FetchLike = fetch): Promise<void> {
  const response = await fetchImpl('/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: encodeFormBody(data),
  });

  if (!response.ok) {
    throw new Error(`Contact form submission failed with status ${response.status}`);
  }
}
