import { NextRequest } from 'next/server';
import { IssueHandler } from '@/lib/handlers';

const issueHandler = new IssueHandler();

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  return issueHandler.getIssue(request, id);
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  return issueHandler.updateIssue(request, id);
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  return issueHandler.deleteIssue(request, id);
}
