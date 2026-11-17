import { describe, expect, it, vi } from 'vitest';
import { CONTACT_FORM_NAME, encodeFormBody, submitContactForm } from './contactForm';

function buildFormData(fields: Record<string, string>): FormData {
  const data = new FormData();
  Object.entries(fields).forEach(([key, value]) => data.append(key, value));
  return data;
}

const validFields = {
  nombre: 'Ana Pérez',
  correo: 'ana@example.com',
  whatsapp: '',
  proyecto: 'Necesito una web para mi clínica & tienda',
};

describe('encodeFormBody', () => {
  it('url-encodes every field and always includes the Netlify form-name', () => {
    const body = encodeFormBody(buildFormData(validFields));
    const params = new URLSearchParams(body);

    expect(params.get('form-name')).toBe(CONTACT_FORM_NAME);
    expect(params.get('nombre')).toBe('Ana Pérez');
    expect(params.get('proyecto')).toBe('Necesito una web para mi clínica & tienda');
  });

  it('does not duplicate form-name when the form already carries it', () => {
    const body = encodeFormBody(buildFormData({ 'form-name': CONTACT_FORM_NAME, ...validFields }));

    expect(new URLSearchParams(body).getAll('form-name')).toEqual([CONTACT_FORM_NAME]);
  });
});

describe('submitContactForm', () => {
  it('posts the encoded form to the site root as urlencoded data', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));

    await submitContactForm(buildFormData(validFields), fetchImpl);

    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe('/');
    expect(init.method).toBe('POST');
    expect(init.headers['Content-Type']).toBe('application/x-www-form-urlencoded');
    expect(new URLSearchParams(init.body).get('correo')).toBe('ana@example.com');
  });

  it('rejects when the server responds with an error status', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(null, { status: 404 }));

    await expect(submitContactForm(buildFormData(validFields), fetchImpl)).rejects.toThrow(/404/);
  });

  it('rejects when the network request fails', async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));

    await expect(submitContactForm(buildFormData(validFields), fetchImpl)).rejects.toThrow('Failed to fetch');
  });
});
