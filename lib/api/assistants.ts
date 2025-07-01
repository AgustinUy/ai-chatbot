import { Assistant } from '@/lib/db/schema';

export interface CreateAssistantRequest {
  name: string;
  instructions: string;
  persona?: string;
}

export interface UpdateAssistantRequest {
  name?: string;
  instructions?: string;
  persona?: string;
}

export class AssistantApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: Response
  ) {
    super(message);
    this.name = 'AssistantApiError';
  }
}

class AssistantApi {
  private baseUrl = '/api/assistants';

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = `Request failed with status ${response.status}`;
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch {
        // If we can't parse the error response, use the default message
        errorMessage = `Request failed with status ${response.status}`;
      }
      throw new AssistantApiError(errorMessage, response.status, response);
    }

    return response.json();
  }

  /**
   * Fetch all assistants for the current user
   */
  async getAssistants(): Promise<Assistant[]> {
    const response = await fetch(this.baseUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return this.handleResponse<Assistant[]>(response);
  }

  /**
   * Get a specific assistant by ID
   */
  async getAssistant(id: string): Promise<Assistant> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return this.handleResponse<Assistant>(response);
  }

  /**
   * Create a new assistant
   */
  async createAssistant(data: CreateAssistantRequest): Promise<Assistant> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    return this.handleResponse<Assistant>(response);
  }

  /**
   * Update an existing assistant
   */
  async updateAssistant(id: string, data: UpdateAssistantRequest): Promise<Assistant> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    return this.handleResponse<Assistant>(response);
  }

  /**
   * Delete an assistant
   */
  async deleteAssistant(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      let errorMessage = `Delete failed with status ${response.status}`;
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch {
        // If we can't parse the error response, use the default message
      }
      
      throw new AssistantApiError(errorMessage, response.status, response);
    }
  }
}

// Export a singleton instance
export const assistantApi = new AssistantApi();

// Export the class for testing purposes
export { AssistantApi };
