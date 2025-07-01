'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import type { Assistant } from '@/lib/db/schema';
import { assistantApi, AssistantApiError } from '@/lib/api/assistants';

interface AssistantCreatorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAssistantCreated: (assistant: Assistant) => void;
}

export function AssistantCreator({
  open,
  onOpenChange,
  onAssistantCreated,
}: AssistantCreatorProps) {
  const [formData, setFormData] = useState({
    name: '',
    instructions: '',
    persona: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const newAssistant = await assistantApi.createAssistant({
        name: formData.name,
        instructions: formData.instructions,
        persona: formData.persona || undefined, // Convert empty string to undefined
      });
      
      onAssistantCreated(newAssistant);
      setFormData({ name: '', instructions: '', persona: '' });
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating assistant:', error);
      if (error instanceof AssistantApiError) {
        // Show user-friendly error message
        alert(`Failed to create assistant: ${error.message}`);
      } else {
        alert('Failed to create assistant. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4 p-6">
        <div className="mb-4">
          <h2 className="text-xl font-bold">Create Custom Assistant</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Assistant Name *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Code Reviewer, Creative Writer"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructions">Instructions *</Label>
            <Textarea
              id="instructions"
              name="instructions"
              value={formData.instructions}
              onChange={handleChange}
              placeholder="Describe what this assistant should do and how it should behave..."
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="persona">Persona (Optional)</Label>
            <Textarea
              id="persona"
              name="persona"
              value={formData.persona}
              onChange={handleChange}
              placeholder="Define the personality, tone, and style of responses..."
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? 'Creating...' : 'Create Assistant'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
