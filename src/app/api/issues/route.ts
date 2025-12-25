import { NextRequest } from 'next/server';
import { IssueHandler } from '@/lib/handlers';

const issueHandler = new IssueHandler();

export async function GET(request: NextRequest) {
  return issueHandler.getAllIssues(request);
}

export async function POST(request: NextRequest) {
  return issueHandler.createIssue(request);
}
