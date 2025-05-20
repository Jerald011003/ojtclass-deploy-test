'use client';

import { useState } from 'react';
import { Copy, RefreshCw } from 'lucide-react';

interface InviteCodeButtonProps {
  classroomId: number;
}

export default function InviteCodeButton({ classroomId }: InviteCodeButtonProps) {
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateCode = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/classrooms/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ classroomId }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate invite code');
      }

      const data = await response.json();
      setInviteCode(data.inviteCode);
    } catch (error) {
      console.error('Error generating invite code:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyCode = async () => {
    if (!inviteCode) return;
    
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying code:', error);
    }
  };

  if (!inviteCode) {
    return (
      <button
        onClick={generateCode}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {loading ? (
          <RefreshCw className="w-4 h-4 animate-spin" />
        ) : (
          'Generate Invite Code'
        )}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="px-4 py-2 font-mono text-sm bg-gray-100 rounded-md">
        {inviteCode}
      </div>
      <button
        onClick={copyCode}
        className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
        title="Copy code"
      >
        <Copy className="w-4 h-4" />
      </button>
      <button
        onClick={generateCode}
        disabled={loading}
        className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
        title="Generate new code"
      >
        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
      </button>
      {copied && (
        <span className="text-sm text-green-600">Copied!</span>
      )}
    </div>
  );
} 