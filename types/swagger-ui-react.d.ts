declare module 'swagger-ui-react' {
  import React from 'react';

  interface SwaggerUIProps {
    spec?: Record<string, unknown>;
    url?: string;
    layout?: string;
    docExpansion?: 'list' | 'full' | 'none';
    defaultModelsExpandDepth?: number;
    displayOperationId?: boolean;
    filter?: boolean | string;
    [key: string]: unknown;
  }

  const SwaggerUI: React.ComponentType<SwaggerUIProps>;
  export default SwaggerUI;
}
