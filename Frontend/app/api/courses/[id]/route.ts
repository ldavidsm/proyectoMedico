import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const cookie = request.headers.get('cookie') || '';

  try {
    const res = await fetch(`${API_URL}/courses/${id}`, {
      method: 'DELETE',
      headers: { cookie },
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({ detail: `Error ${res.status}` }));
      return NextResponse.json(body, { status: res.status });
    }

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error('Proxy DELETE /courses error:', err);
    return NextResponse.json(
      { detail: 'No se pudo conectar con el servidor' },
      { status: 502 }
    );
  }
}
