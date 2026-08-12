import { NextResponse } from 'next/server';

export async function GET() {
  const models = [
    { id: 'gpt-4o', name: 'GPT-4o' },
    { id: 'gpt-4', name: 'GPT-4' },
    { id: 'text-davinci-002-render-sha', name: 'Legacy' },
  ];
  return NextResponse.json({ object: 'list', data: models });
}
