'use client';

import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';
import { openApiSpec } from '@/lib/swagger';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useTheme } from '@/components/ThemeProvider';

const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

export default function ApiDocsPage() {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'swagger-dark' : ''}`}>
      <style jsx global>{`
        /* Swagger UI Dark Mode Overrides */
        .swagger-dark .swagger-ui {
          background-color: #1f2937;
        }
        .swagger-dark .swagger-ui .topbar {
          background-color: #111827;
        }
        .swagger-dark .swagger-ui .info .title,
        .swagger-dark .swagger-ui .info .base-url,
        .swagger-dark .swagger-ui .info p,
        .swagger-dark .swagger-ui .info li,
        .swagger-dark .swagger-ui .opblock-tag,
        .swagger-dark .swagger-ui .opblock .opblock-summary-operation-id,
        .swagger-dark .swagger-ui .opblock .opblock-summary-path,
        .swagger-dark .swagger-ui .opblock .opblock-summary-description,
        .swagger-dark .swagger-ui .opblock-description-wrapper p,
        .swagger-dark .swagger-ui .opblock-external-docs-wrapper p,
        .swagger-dark .swagger-ui .opblock-title_normal,
        .swagger-dark .swagger-ui table thead tr th,
        .swagger-dark .swagger-ui table thead tr td,
        .swagger-dark .swagger-ui .parameter__name,
        .swagger-dark .swagger-ui .parameter__type,
        .swagger-dark .swagger-ui .parameter__in,
        .swagger-dark .swagger-ui .response-col_status,
        .swagger-dark .swagger-ui .response-col_description,
        .swagger-dark .swagger-ui .responses-inner h4,
        .swagger-dark .swagger-ui .responses-inner h5,
        .swagger-dark .swagger-ui .model-title,
        .swagger-dark .swagger-ui .model,
        .swagger-dark .swagger-ui section.models h4,
        .swagger-dark .swagger-ui .servers-title,
        .swagger-dark .swagger-ui .servers label {
          color: #e5e7eb !important;
        }
        .swagger-dark .swagger-ui .info a {
          color: #60a5fa !important;
        }
        .swagger-dark .swagger-ui .opblock-tag {
          border-bottom-color: #374151 !important;
        }
        .swagger-dark .swagger-ui .opblock {
          border-color: #374151 !important;
          background: #111827 !important;
        }
        .swagger-dark .swagger-ui .opblock .opblock-summary {
          border-color: #374151 !important;
        }
        .swagger-dark .swagger-ui .opblock-body {
          background: #1f2937 !important;
        }
        .swagger-dark .swagger-ui .opblock-section-header {
          background: #374151 !important;
        }
        .swagger-dark .swagger-ui .opblock-section-header h4 {
          color: #e5e7eb !important;
        }
        .swagger-dark .swagger-ui table tbody tr td {
          color: #d1d5db !important;
          border-color: #374151 !important;
        }
        .swagger-dark .swagger-ui .model-box {
          background: #374151 !important;
        }
        .swagger-dark .swagger-ui section.models {
          border-color: #374151 !important;
        }
        .swagger-dark .swagger-ui section.models.is-open h4 {
          border-color: #374151 !important;
        }
        .swagger-dark .swagger-ui .model-container {
          background: #1f2937 !important;
        }
        .swagger-dark .swagger-ui select,
        .swagger-dark .swagger-ui input[type=text],
        .swagger-dark .swagger-ui textarea {
          background: #374151 !important;
          color: #e5e7eb !important;
          border-color: #4b5563 !important;
        }
        .swagger-dark .swagger-ui .btn {
          color: #e5e7eb !important;
          border-color: #4b5563 !important;
        }
        .swagger-dark .swagger-ui .copy-to-clipboard {
          background: #374151 !important;
        }
        .swagger-dark .swagger-ui .scheme-container {
          background: #1f2937 !important;
        }
      `}</style>
      <div className="bg-gray-800 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/"
            className="p-2 text-gray-300 hover:text-white transition-colors"
            title="Back to main page"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <h1 className="text-xl font-bold">Multi-Lingua API Documentation</h1>
        </div>
        <ThemeToggle />
      </div>
      <div className={theme === 'dark' ? 'bg-gray-800' : 'bg-white'}>
        <SwaggerUI spec={openApiSpec} />
      </div>
    </div>
  );
}
