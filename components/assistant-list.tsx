'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AssistantCreator } from './assistant-creator';
import type { Assistant } from '@/lib/db/schema';
import { ChevronDownIcon } from '@/components/icons';
import { useRouter } from 'next/navigation';
import { assistantApi, AssistantApiError } from '@/lib/api/assistants';

// Simple right chevron icon component
const ChevronRightIcon = ({ size = 16 }: { size?: number }) => (
  <svg
    height={size}
    width={size}
    viewBox="0 0 16 16"
    fill="currentColor"
    style={{ color: 'currentcolor' }}
  >
    <path d="M6.22 3.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06L7.28 10.78a.75.75 0 0 1-1.06-1.06L8.94 6 6.22 3.28a.75.75 0 0 1 0-1.06Z" />
  </svg>
);

interface AssistantListProps {
  onAssistantSelect: (assistant: Assistant) => void;
}

export function AssistantList({ onAssistantSelect }: AssistantListProps) {
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [showCreator, setShowCreator] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expandedAssistants, setExpandedAssistants] = useState<Set<string>>(new Set());
  const [selectedAssistantId, setSelectedAssistantId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchAssistants();
    // Load selected assistant from localStorage
    const storedAssistantId = localStorage.getItem('selectedAssistantId');
    if (storedAssistantId) {
      setSelectedAssistantId(storedAssistantId);
    }

    // Listen for storage changes (when other components clear the selection)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'selectedAssistantId') {
        setSelectedAssistantId(e.newValue);
      }
    };

    // Listen for custom events (for same-tab changes)
    const handleCustomStorageChange = () => {
      const storedAssistantId = localStorage.getItem('selectedAssistantId');
      setSelectedAssistantId(storedAssistantId);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('assistantSelectionChanged', handleCustomStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('assistantSelectionChanged', handleCustomStorageChange);
    };
  }, []);

  const fetchAssistants = async () => {
    try {
      const data = await assistantApi.getAssistants();
      setAssistants(data);
    } catch (error) {
      console.error('Error fetching assistants:', error);
      if (error instanceof AssistantApiError) {
        // Handle specific API errors if needed
        console.error('API Error:', error.status, error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAssistantCreated = (newAssistant: Assistant) => {
    setAssistants([newAssistant, ...assistants]);
  };

  const handleDeleteAssistant = async (id: string) => {
    if (confirm('Are you sure you want to delete this assistant?')) {
      try {
        await assistantApi.deleteAssistant(id);
        setAssistants(assistants.filter(assistant => assistant.id !== id));
        
        // Clear selection if we're deleting the selected assistant
        if (selectedAssistantId === id) {
          handleClearSelection();
        }
      } catch (error) {
        console.error('Error deleting assistant:', error);
        if (error instanceof AssistantApiError) {
          // Show user-friendly error message
          alert(`Failed to delete assistant: ${error.message}`);
        } else {
          alert('Failed to delete assistant. Please try again.');
        }
      }
    }
  };

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedAssistants);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedAssistants(newExpanded);
  };

  const handleSelectAssistant = (assistant: Assistant) => {
    // If already selected, deselect it
    if (selectedAssistantId === assistant.id) {
      handleClearSelection();
      return;
    }
    
    // Store in localStorage for persistence
    localStorage.setItem('selectedAssistantId', assistant.id);
    localStorage.setItem('selectedAssistant', JSON.stringify(assistant));
    setSelectedAssistantId(assistant.id);
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('assistantSelectionChanged'));
    
    // Call the parent callback
    onAssistantSelect(assistant);
    
    // Navigate to a new chat with the assistant
    router.push('/');
    
  };

  const handleClearSelection = () => {
    localStorage.removeItem('selectedAssistantId');
    localStorage.removeItem('selectedAssistant');
    setSelectedAssistantId(null);
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('assistantSelectionChanged'));
    
    router.push('/');
  };

  if (loading) {
    return <div className="p-4">Loading assistants...</div>;
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center px-2">
        <h2 className="text-sm font-semibold">Custom Assistants</h2>
        <div className="flex gap-1">
          {selectedAssistantId && (
            <Button 
              onClick={handleClearSelection}
              variant="ghost"
              size="sm"
              className="text-xs px-2 py-1 h-auto text-red-600"
            >
              Clear
            </Button>
          )}
          <Button 
            onClick={() => setShowCreator(true)}
            variant="ghost"
            size="sm"
            className="text-xs px-2 py-1 h-auto"
          >
            <span className="mr-1">+</span>
            New
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {assistants.length === 0 ? (
          <div className="px-2">
            <p className="text-center text-gray-500 text-xs">
              No custom assistants yet. Create your first one!
            </p>
          </div>
        ) : (
          assistants.map((assistant) => {
            const isExpanded = expandedAssistants.has(assistant.id);
            const isSelected = selectedAssistantId === assistant.id;
            return (
              <Card
                key={assistant.id}
                className={`transition-all ${isSelected ? 'ring-2 ring-green-500' : ''}`}
              >
                {/* Always visible header with title and expand/collapse button */}
                <div className="flex items-center justify-between p-3">
                  <div className="flex items-center gap-2 flex-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpanded(assistant.id)}
                      className="p-1 h-auto"
                    >
                      {isExpanded ? (
                        <ChevronDownIcon size={14} />
                      ) : (
                        <ChevronRightIcon size={14} />
                      )}
                    </Button>
                    <h3 
                      className={`font-medium text-sm cursor-pointer flex-1 ${isSelected ? 'text-green-600' : ''}`}
                      onClick={() => toggleExpanded(assistant.id)}
                    >
                      {assistant.name}
                      {isSelected && <span className="ml-2 text-xs text-green-600">●</span>}
                    </h3>
                  </div>
                  
                  {/* Action buttons - always visible */}
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSelectAssistant(assistant)}
                      className={`text-xs px-2 py-1 h-auto ${isSelected ? 'text-green-600 font-medium' : ''}`}
                    >
                      {isSelected ? 'Selected' : 'Select'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteAssistant(assistant.id);
                      }}
                      className="text-red-500 hover:text-red-700 text-xs px-2 py-1 h-auto"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
                
                {/* Expandable content */}
                {isExpanded && (
                  <div className="px-3 pb-3 border-t pt-3">
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Instructions:</strong>
                    </p>
                    <p className="text-sm text-gray-600 mb-3">
                      {assistant.instructions}
                    </p>
                    {assistant.persona && (
                      <>
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>Persona:</strong>
                        </p>
                        <p className="text-sm text-gray-600 mb-3">
                          {assistant.persona}
                        </p>
                      </>
                    )}
                    <p className="text-xs text-gray-400">
                      Created {new Date(assistant.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>

      <AssistantCreator
        open={showCreator}
        onOpenChange={setShowCreator}
        onAssistantCreated={handleAssistantCreated}
      />
    </div>
  );
}
