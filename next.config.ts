import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Vacancy import accepts spreadsheets up to 10MB (enforced again in
      // uploadVacancyImportFile itself); this just raises the framework's
      // default 1MB server action body limit to allow that upload through.
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;
