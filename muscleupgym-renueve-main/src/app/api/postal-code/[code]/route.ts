import { NextResponse } from 'next/server';

interface PostaliaColonia {
  nombre: string;
  tipo: string;
}

interface PostaliaResponse {
  codigo_postal: string;
  estado: string;
  municipio: string;
  ciudad?: string;
  zona?: string;
  colonias: PostaliaColonia[];
}

// Normalizamos la respuesta para que el componente pueda reutilizar su lógica actual
function normalize(postalia: PostaliaResponse) {
  return postalia.colonias.map((c) => ({
    codigo_postal: postalia.codigo_postal,
    estado: postalia.estado,
    municipio: postalia.municipio,
    ciudad: postalia.ciudad || '',
    colonia: c.nombre,
    tipo_colonia: c.tipo,
  }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  if (!code || code.length !== 5 || !/^\d+$/.test(code)) {
    return NextResponse.json({ error: 'Código postal inválido' }, { status: 400 });
  }

  const token = process.env.POSTALIA_API_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: 'Token de Postalia no configurado en el servidor' },
      { status: 500 }
    );
  }

  const url = `https://www.postalia.com.mx/api/codigos-postales/${code}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10 segundos
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Código postal no encontrado' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: `Error externo (${response.status}) al consultar Postalia` },
        { status: 502 }
      );
    }

    const data = (await response.json()) as PostaliaResponse;
    if (!data || !data.colonias || !Array.isArray(data.colonias)) {
      return NextResponse.json(
        { error: 'Respuesta inesperada de Postalia' },
        { status: 500 }
      );
    }

    const normalized = normalize(data);
    return NextResponse.json(normalized, { status: 200 });
  } catch (err: unknown) {
    const error = err as { name?: string; code?: string; cause?: { code?: string } };
    
    // Detectar timeouts y errores de conexión
    if (
      error?.name === 'AbortError' ||
      error?.code === 'ETIMEDOUT' ||
      error?.code === 'ECONNREFUSED' ||
      error?.code === 'ENOTFOUND' ||
      error?.cause?.code === 'ETIMEDOUT' ||
      error?.cause?.code === 'ECONNREFUSED'
    ) {
      console.warn('Postalia timeout/conexión:', error?.code || error?.cause?.code);
      return NextResponse.json(
        { error: 'El servicio de códigos postales no está disponible temporalmente. Intenta de nuevo.' },
        { status: 504 }
      );
    }
    
    console.error('Error Postalia:', err);
    return NextResponse.json(
      { error: 'Error interno al consultar código postal' },
      { status: 500 }
    );
  }
}

